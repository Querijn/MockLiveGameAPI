import process from "process";
import express from "express";
import https from "https";
import fs from "fs";
import path from 'path';

import { LiveGame } from "./live_game";
import { DDragon } from "./ddragon";
import fetch from "node-fetch";

const appRoot = path.resolve(__dirname, "../");
const privateKey = fs.readFileSync(path.resolve(appRoot, 'server/key.pem')).toString();
const certificate = fs.readFileSync(path.resolve(appRoot, 'server/cert.pem')).toString();
const app = express();
const keyRegex = /(RGAPI-)?[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/ig;

let port = 2999;
let locale = "en_US";
let apiKey = "";
let region = "euw1";
let matchId = 4665685331;
let verbose = false;
let gameSpeed = 1;

function validateKey(): boolean {
	try {
		// Check if the argument is a key
		if (keyRegex.test(apiKey))
			return true;

		// Is it an env variable?
		let newKey = process.env[apiKey];
		if (newKey && keyRegex.test(newKey)) {
			apiKey = newKey;
			return true;
		}

		// is it a file?
		newKey = fs.existsSync(apiKey) ? fs.readFileSync(apiKey).toString() : undefined;
		if (newKey && keyRegex.test(newKey)) {
			apiKey = newKey;
			return true;
		}

		return false;
	}
	catch (e) {
		console.error(`Exception occurred trying to evaluate key argument '${apiKey}': ${e}`);
		return false;
	}
}

(async function() {
	console.log("Parsing arguments");
	// Parse arguments

	let i = 2;

	console.log(process.argv);

	for (; i < process.argv.length; i++) {
		switch (process.argv[i]) {
			case "-port":
			case "-p": {
				port = parseInt(process.argv[++i]);
				break;
			}

			case "-locale":
			case "-l": {
				locale = process.argv[++i];

				const localeRequest = await fetch("https://ddragon.leagueoflegends.com/cdn/languages.json");
				if (!localeRequest.ok)
					throw "Request for locale types from DDragon has failed!";
				const locales = <string[]>await localeRequest.json();
				if (locales.indexOf(locale) < 0)
					throw `'${locale}' is not a valid locale. Needs to be one of the following: ${locales.join(", ")}`;
				break;
			}

			case "-region":
			case "-r": {
				region = process.argv[++i];
				break;
			}

			case "-apikey":
			case "-k": {
				apiKey = process.argv[++i];
				break;
			}

			case "-match":
			case "-m": {
				matchId = parseInt(process.argv[++i]);
				break;
			}

			case "-gamespeed":
			case "-s": {
				gameSpeed = parseFloat(process.argv[++i])
				break;
			}

			case "-verbose":
			case "-v": {
				verbose = true;
				break;
			}
		}
	}

	let matchData: any = null;
	let timelineData: any = null;
	if (fs.existsSync(path.resolve(appRoot, "match.json")) && fs.existsSync(path.resolve(appRoot, "timeline.json"))) {
		console.log(`Found existing local match data..`);
		matchData = JSON.parse(fs.readFileSync(path.resolve(appRoot, "match.json")).toString());
		timelineData = JSON.parse(fs.readFileSync(path.resolve(appRoot, "timeline.json")).toString());
	}

	if (validateKey()) {
		console.log(`Downloading game data for ${matchId} (${region})..`);
		const matchRequest = await fetch(`https://${region}.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${apiKey}`);
		if (!matchRequest.ok && matchData == null) {
			throw `Could not fetch "/lol/match/v4/matches/${matchId}" (region '${region}'), request returned ${matchRequest.status} ${matchRequest.statusText}`;
		}
		else if (matchRequest.ok) {
			const matchText = await matchRequest.text();
			fs.writeFileSync(path.resolve(appRoot, "match.json"), matchText);
			matchData = JSON.parse(matchText);
			console.log("Downloaded match");
		}

		const timelineRequest = await fetch(`https://${region}.api.riotgames.com/lol/match/v4/timelines/by-match/${matchId}?api_key=${apiKey}`);
		if (!timelineRequest.ok && timelineData == null) {
			throw `Could not fetch "/lol/match/v4/timelines/by-match/${matchId}" (region '${region}'), request returned ${timelineRequest.status} ${timelineRequest.statusText}`;
		}
		else if (timelineRequest.ok) {
			const matchText = await timelineRequest.text();
			fs.writeFileSync(path.resolve(appRoot, "timeline.json"), matchText);
			timelineData = JSON.parse(matchText);
			console.log("Downloaded timeline");
		}
	}

	let game = new LiveGame();
	await game.startGame({ match: matchData, timeline: timelineData, locale, verbose, speedMultiplier: gameSpeed });

	if (verbose) {
		setInterval(() => {
			game.update();
		}, 1000);
	}

	console.log("Initialising server");
	app.get('/liveclientdata/allgamedata', function (req, res) {
		game.isRunning ? res.send(game.allData) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/activeplayer', function (req, res) {
		game.isRunning ? res.send(game.activePlayer) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/activeplayername', function (req, res) {
		game.isRunning ? res.send(game.activePlayerName) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/activeplayerabilities', function (req, res) {
		game.isRunning ? res.send(game.activePlayerAbilities) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/activeplayerrunes', function (req, res) {
		game.isRunning ? res.send(game.activePlayerRunes) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/eventdata', function (req, res) {
		game.isRunning ? res.send(game.events) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/gamestats', function (req, res) {
		game.isRunning ? res.send(game.stats) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/playerscores', function (req, res) {
		const queryName = req.query["summonerName"];
		const summonerName = typeof queryName === 'string' ? queryName : undefined;
		game.isRunning ? res.send(game.getPlayerScore(summonerName)) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/playersummonerspells', function (req, res) {
		const queryName = req.query["summonerName"];
		const summonerName = typeof queryName === 'string' ? queryName : undefined;
		game.isRunning ? res.send(game.getPlayerSummoners(summonerName)) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/playeritems', function (req, res) {
		const queryName = req.query["summonerName"];
		const summonerName = typeof queryName === 'string' ? queryName : undefined;
		game.isRunning ? res.send(game.getPlayerItems(summonerName)) : res.status(500).send("No game running");
	});

	app.use(express.static('public'));

	https.createServer({ key: privateKey, cert: certificate }, app).listen(port, () => {
		console.log(`Mock Live Game API started at https://localhost:${port}`);
	});
})();
