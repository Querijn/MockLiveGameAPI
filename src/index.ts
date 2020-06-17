import process from "process";
import express from "express";
import https from "https";
import fs from "fs";

import { LiveGame } from "./live_game";
import { DDragon } from "./ddragon";

const privateKey = fs.readFileSync('server/key.pem').toString();
const certificate = fs.readFileSync('server/cert.pem').toString();
const app = express();

let port = 2999;
let locale = "en_US";
let gameVersion: string | null = null;
let shouldStart = false;

(async function() {
	console.log("Fetching available League of Legends versions...");
	const gameVersions = <string[]>await DDragon.getAllVersions();
	gameVersion = gameVersions[0];

	console.log("Parsing arguments");
	// Parse arguments
	for (let i = 2; i < process.argv.length; i++) {
		switch (process.argv[i]) {

			case "-port":
			case "-p": {
				port = parseInt(process.argv[++i]);
				break;
			}

			case "-patch":
			case "-v": {
				const potentialGameVersion = process.argv[++i];
				if (gameVersions.indexOf(potentialGameVersion) < 0)
					throw `Unable to parse game version ${potentialGameVersion}. It needs to match one of the DDragon versions listed here: https://ddragon.leagueoflegends.com/api/versions.json`;
				gameVersion = potentialGameVersion;
				break;
			}

			case "-autorun":
			case "-r": {
				shouldStart = true;
				break;
			}
		}
	}

	console.log("Initialising server");
	let game = new LiveGame();
	//if (shouldStart) // TODO
		await game.startGame({ allies: [ { isYou: true } ] });

	app.get('/liveclientdata/allgamedata', function (req, res) {
		game.isRunning ? res.send(game.allData) : res.status(500).send("No game running");
	});

	app.get('/liveclientdata/activeplayer', function (req, res) {
		game.isRunning ? res.send(game.activePlayer) : res.status(500).send("No game running");
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