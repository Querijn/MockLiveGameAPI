/// <reference path="../types/live_game.d.ts"/>
/// <reference path="../types/ddragon_champion.d.ts"/>
/// <reference path="../types/ddragon_item.d.ts"/>
/// <reference path="../types/riot_match.d.ts"/>

import { performance } from "perf_hooks";
import { DDragon } from "./ddragon";
import LiveGamePlayer from "./live_game/player";
import LiveGameActivePlayer from "./live_game/active_player";

export interface LiveGameOptions {
	match: RiotAPI.Match;
	timeline: RiotAPI.MatchTimeline;
	locale?: string;
	verbose?: boolean;
	speedMultiplier?: number;
};

export class LiveGame {

	private data: LiveGameAPI.Response | null;
	private options: LiveGameOptions | null;
	private startTime: number = 0;
	private lastFrameTime: number = 0;
	private championData: DDragonChampion.JSON | null;
	private itemData: DDragonItem.JSON | null;
	private goldCounter = 0;
	private timelineEvents: RiotAPI.Event[] = [];
	private lastEventId = 0;
	private killOffset: {[id: number] : number };

	constructor() {
	}

	get optionsForNextGame() {
		return this.options;
	}

	generateCurrentPlayer(): LiveGameAPI.ActivePlayer | undefined {
		if (this.options == null)
			throw "Unable to generate current player: Cannot initialise game without options!";
		if (this.championData == null)
			throw "Unable to generate current player: Cannot initialise game without DDragon!";

		const you = this.options.match.participants[0];
		if (!you) // Basically, fake a replay.
			return;

		const yourIdentity = this.options.match.participantIdentities.find(id => id.participantId == you.participantId);
		if (!yourIdentity)
			return;

		const findChampion = you.championId.toString() || "Aatrox";
		const championList = Object.values(this.championData.data);
		const champion = championList.find(c => c.id === findChampion || c.key === findChampion);
		if (champion == null)
			throw `Unable to generate current player: Unable to identify '${findChampion}' as a champion!`;

		let getAbility = (index: number) => {
			return {
				abilityLevel: 0,
				displayName: champion.spells[index].name,
				id: champion.spells[index].id,
				rawDescription: `GeneratedTip_Spell_${champion.spells[index].id}_Description`,
				rawDisplayName: `GeneratedTip_Spell_${champion.spells[index].id}_DisplayName`
			};
		}

		return new LiveGameActivePlayer({
			level: 1,
			summonerName: yourIdentity.player.summonerName || "Holland",
			currentGold: this.goldCounter,

			abilities: {
				Q: getAbility(0),
				W: getAbility(1),
				E: getAbility(2),
				R: getAbility(3),
				Passive: {
					displayName: champion.passive.name,
					id: champion.id + "Passive",
					rawDescription: `GeneratedTip_Passive_${champion.passive.name}_Description`,
					rawDisplayName: `GeneratedTip_Passive_${champion.passive.name}_DisplayName`
				}
			},

			championStats: {
				abilityPower: 0,
				armor: champion.stats.armor,
				armorPenetrationFlat: 0,
				armorPenetrationPercent: 0,
				attackDamage: champion.stats.attackdamage,
				attackRange: champion.stats.attackrange,
				attackSpeed: champion.stats.attackspeed,
				bonusArmorPenetrationPercent: 0,
				bonusMagicPenetrationPercent: 0,
				cooldownReduction: 0,
				critChance: 0,
				critDamage: 0,
				currentHealth: champion.stats.hp,
				healthRegenRate: champion.stats.hpregen,
				lifeSteal: 0,
				magicLethality: 0,
				magicPenetrationFlat: 0,
				magicPenetrationPercent: 0,
				magicResist: champion.stats.spellblock,
				maxHealth: champion.stats.hp,
				moveSpeed: champion.stats.movespeed,
				physicalLethality: 0,
				resourceMax: champion.stats.mp,
				resourceRegenRate: champion.stats.mpregen,
				resourceType: "MANA", // TODO
				resourceValue: champion.stats.mp,
				spellVamp: 0,
				tenacity: 0
			},
			fullRunes: { // TODO: Allow this to be generated.
				generalRunes: [
					{
						displayName: "Electrocute",
						id: 8112,
						rawDescription: "perk_tooltip_Electrocute",
						rawDisplayName: "perk_displayname_Electrocute"
					},
					{
						displayName: "Cheap Shot",
						id: 8126,
						rawDescription: "perk_tooltip_CheapShot",
						rawDisplayName: "perk_displayname_CheapShot"
					},
					{
						displayName: "Eyeball Collection",
						id: 8138,
						rawDescription: "perk_tooltip_EyeballCollection",
						rawDisplayName: "perk_displayname_EyeballCollection"
					},
					{
						displayName: "Relentless Hunter",
						id: 8105,
						rawDescription: "perk_tooltip_8105",
						rawDisplayName: "perk_displayname_8105"
					},
					{
						displayName: "Celerity",
						id: 8234,
						rawDescription: "perk_tooltip_Celerity",
						rawDisplayName: "perk_displayname_Celerity"
					},
					{
						displayName: "Gathering Storm",
						id: 8236,
						rawDescription: "perk_tooltip_GatheringStorm",
						rawDisplayName: "perk_displayname_GatheringStorm"
					}
				],
				keystone: {
					displayName: "Electrocute",
					id: 8112,
					rawDescription: "perk_tooltip_Electrocute",
					rawDisplayName: "perk_displayname_Electrocute"
				},
				primaryRuneTree: {
					displayName: "Domination",
					id: 8100,
					rawDescription: "perkstyle_tooltip_7200",
					rawDisplayName: "perkstyle_displayname_7200"
				},
				secondaryRuneTree: {
					displayName: "Sorcery",
					id: 8200,
					rawDescription: "perkstyle_tooltip_7202",
					rawDisplayName: "perkstyle_displayname_7202"
				},
				statRunes: [
					{
						id: 5008,
						rawDescription: "perk_tooltip_StatModAdaptive"
					},
					{
						id: 5003,
						rawDescription: "perk_tooltip_StatModMagicResist"
					},
					{
						id: 5003,
						rawDescription: "perk_tooltip_StatModMagicResist"
					}
				]
			}
		});
	}

	generateAllPlayers(you: RiotAPI.Participant): LiveGameAPI.Player[] {
		if (this.options == null)
			throw "Unable to generate current player: Cannot initialise game without options!";
		if (this.championData == null)
			throw "Unable to generate current player: Cannot initialise game without DDragon!";

		const players: LiveGameAPI.Player[] = [];
		const alliedTeamIsRed = you.teamId == 200;

		const handlePlayer = (player: RiotAPI.Participant, ally: boolean) => {
			const findChampion = player.championId.toString() || "Aatrox";
			const championList = Object.values(this.championData?.data || {});
			const champion = championList.find(c => c.id === findChampion || c.key === findChampion);
			if (champion == null)
				throw `Unable to generate current player: Unable to identify '${findChampion}' as a champion!`;

			const ident = this.options?.match.participantIdentities.find(id => id.participantId == player.participantId);
			players.push(new LiveGamePlayer({
				championName: champion.name,
				isBot: false, // TODO
				isDead: false,
				items: [],
				level: 0,
				position: "", // ???
				rawChampionName: `game_character_displayname_${champion.id}`,
				respawnTimer: 0,
				runes: { // TODO
					keystone: {
						displayName: "Electrocute",
						id: 8112,
						rawDescription: "perk_tooltip_Electrocute",
						rawDisplayName: "perk_displayname_Electrocute"
					},
					primaryRuneTree: {
						displayName: "Domination",
						id: 8100,
						rawDescription: "perkstyle_tooltip_7200",
						rawDisplayName: "perkstyle_displayname_7200"
					},
					secondaryRuneTree: {
						displayName: "Sorcery",
						id: 8200,
						rawDescription: "perkstyle_tooltip_7202",
						rawDisplayName: "perkstyle_displayname_7202"
					}
				},
				scores: {
					assists: 0,
					creepScore: 0,
					deaths: 0,
					kills: 0,
					wardScore: 0.0
				},
				skinID: 0,
				summonerName: ident?.player.summonerName || `${champion.name} Bot`,
				summonerSpells: { // TODO
					summonerSpellOne: {
						displayName: "Flash",
						rawDescription: "GeneratedTip_SummonerSpell_SummonerFlash_Description",
						rawDisplayName: "GeneratedTip_SummonerSpell_SummonerFlash_DisplayName"
					},
					summonerSpellTwo: {
						displayName: "Ignite",
						rawDescription: "GeneratedTip_SummonerSpell_SummonerDot_Description",
						rawDisplayName: "GeneratedTip_SummonerSpell_SummonerDot_DisplayName"
					}
				},
				team: ally === alliedTeamIsRed ? "CHAOS" : "ORDER"
			}));
		}

		const allies = this.options.match.participants.filter(p => p.teamId == you.teamId);
		const opponents = this.options.match.participants.filter(p => p.teamId != you.teamId);
		for (const player of allies)
			handlePlayer(player, true);
		for (const player of opponents)
			handlePlayer(player, false);

		return players;
	}

	async startGame(options: LiveGameOptions) {
		this.options = options;
		this.lastFrameTime = this.startTime = performance.now();
		this.timelineEvents = [];
		this.lastEventId = -1;

		switch (options.match.gameMode) {
			case "ARAM":
				this.goldCounter = 1400;
				break;

			default:
				this.goldCounter = 500;
				break;
		}

		this.options.speedMultiplier = (this.options.speedMultiplier || 1);

		const locale = this.options.locale || "en_US";

		const v = this.options.match.gameVersion.split(".");
		const patch = `${v[0]}.${v[1]}.1` || (await DDragon.getAllVersions())[0]; // latest

		// Init ddragon
		const championResponse = await DDragon.request("championFull.json", patch, locale);
		if (championResponse.ok == false)
			throw `Unable to initialise game, unable to fetch DDragon's championFull.json file (patch: ${patch}, locale: ${locale})!`;
		this.championData = <DDragonChampion.JSON>(await championResponse.json());

		const itemResponse = await DDragon.request("item.json", patch, locale);
		if (itemResponse.ok == false)
			throw `Unable to initialise game, unable to fetch DDragon's item.json file (patch: ${patch}, locale: ${locale})!`;
		this.itemData = <DDragonItem.JSON>(await itemResponse.json());

		// Put all events in order
		for (const frame of this.options.timeline.frames)
			this.timelineEvents.push(...frame.events);
		this.timelineEvents = this.timelineEvents.sort((a, b) => a.timestamp - b.timestamp);

		const you = this.options.match.participants[0];
		const mapNumber = this.options.match.mapId || 11; // Summoner's Rift
		this.data = {
			activePlayer: this.generateCurrentPlayer(),
			allPlayers: this.generateAllPlayers(you),
			events: {
				Events: [{
					EventID: 0,
					EventName: "GameStart",
					EventTime: 0,
				}]
			},
			gameData: {
				gameMode: this.options.match.gameMode || "CLASSIC",
				gameTime: 0,
				mapName: "Map" + mapNumber,
				mapNumber: mapNumber,
				mapTerrain: "Default"
			}
		};
	}

	update() {
		if (this.data == null || this.itemData == null)
			throw "Cannot update LiveGame! It has not been initialised!";

		const speedMult = (this.options?.speedMultiplier || 1);
		const deltaSec = ((performance.now() - this.lastFrameTime) / 1000) * speedMult;
		this.lastFrameTime = performance.now();

		const gameTimeMS = (performance.now() - this.startTime) * speedMult;
		this.data.gameData.gameTime = gameTimeMS / 1000;

		// Process timeline events
		while (true) {
			const nextEventId = this.lastEventId + 1;
			const event = this.timelineEvents[nextEventId];
			if (event == null || event.timestamp > gameTimeMS)
				break;
			
			const participantId = event.participantId || -1;
			let participant = this.options?.match.participantIdentities.find(p => p.participantId == participantId);

			this.lastEventId++;
			switch (event.type) {
				case "SKILL_LEVEL_UP": {
					if (participant == null)
						throw `Unable to process SKILL_LEVEL_UP without a participant!`;

					const key = [ "UNKNOWN", "Q", "W", "E", "R" ][event.skillSlot || 0];
					console.log(`An event occurred: ${participant.player.summonerName} (id ${participantId}) leveled up ${key}.`);
					
					const player = <LiveGamePlayer|undefined>this.data.allPlayers.find(p => p.summonerName === participant?.player.summonerName);
					if (player != null)
						player.level++;

					if (this.data.activePlayer && participant.player.summonerName == this.data.activePlayer.summonerName) {
						const activePlayer = <LiveGameActivePlayer>(this.data.activePlayer); 
						
						const ability = activePlayer.abilities[key];
						if (typeof ability.abilityLevel !== 'undefined')
							ability.abilityLevel++;
					}
					break;
				}

				case "ITEM_PURCHASED": {
					if (participant == null)
						throw `Unable to process ITEM_PURCHASED without a participant!`;

					const itemId = (event.itemId || "1001").toString();
					const item = this.itemData.data[itemId];
					console.log(`An event occurred: ${participant.player.summonerName} (id ${participantId}) purchased ${item.name} (${itemId}).`);
					
					const player = <LiveGamePlayer>this.data.allPlayers.find(p => p.summonerName === participant?.player.summonerName);
					if (player == null)
						throw `Could not find player ${participant.player.summonerName} in the game!`;

					if (item.gold && this.data.activePlayer && player.summonerName == this.data.activePlayer.summonerName) {
						const activePlayer = <LiveGameActivePlayer>(this.data.activePlayer); 
						activePlayer.spendGold(player, itemId, this.itemData);
					}

					player.addItem(itemId, item);
					break;
				}

				case "ITEM_SOLD": {
					if (participant == null)
						throw `Unable to process ITEM_SOLD without a participant!`;

					const itemId = (event.itemId || "1001").toString();
					const item = this.itemData.data[itemId];
					console.log(`An event occurred: ${participant.player.summonerName} (id ${participantId}) sold item ${item.name} (${event.itemId}).`);

					const player = <LiveGamePlayer>this.data.allPlayers.find(p => p.summonerName === participant?.player.summonerName);
					if (player == null)
						throw `Could not find player ${participant.player.summonerName} in the game!`;

					if (item.gold && this.data.activePlayer && player.summonerName == this.data.activePlayer.summonerName) {
						const activePlayer = <LiveGameActivePlayer>(this.data.activePlayer); 
						activePlayer.refundGold(player, itemId, this.itemData, true);
					}

					player.removeItem(itemId, item);
					break;
				}

				case "ITEM_UNDO":
				case "ITEM_DESTROYED": {
					if (participant == null)
						throw `Unable to process ITEM_UNDO/ITEM_DESTROYED without a participant!`;

					const itemId = (event.itemId || "1001").toString();
					const item = this.itemData.data[itemId];
					const wasUsed = event.type == "ITEM_DESTROYED" ? true : false;
					console.log(`An event occurred: ${participant.player.summonerName} (id ${participantId}) ${wasUsed ? "used" : "refunded"} item ${item.name} (${event.itemId}).`);

					const player = <LiveGamePlayer>this.data.allPlayers.find(p => p.summonerName === participant?.player.summonerName);
					if (player == null)
						throw `Could not find player ${participant.player.summonerName} in the game!`;

					if (!wasUsed && item.gold && this.data.activePlayer && player.summonerName == this.data.activePlayer.summonerName) {
						const activePlayer = <LiveGameActivePlayer>(this.data.activePlayer); 
						activePlayer.refundGold(player, itemId, this.itemData, false);
					}

					player.removeItem(itemId, item);
					break;
				}

				case "CHAMPION_KILL": {
					if (event.assistingParticipantIds == null)
						throw "Unexpected null assistingParticipantIds in CHAMPION_KILL";
					let killer = this.options?.match.participantIdentities.find(p => p.participantId == event.killerId);
					let victim = this.options?.match.participantIdentities.find(p => p.participantId == event.victimId);
					let assistants = event.assistingParticipantIds.map(id => this.options?.match.participantIdentities.find(p => p.participantId == id));

					for (const player of this.data.allPlayers) {
						const participant = this.options?.match.participantIdentities.find(p => p.player.summonerName === player.summonerName);
						if (!participant)
							continue;

						if (event.killerId == participant.participantId)
							player.scores.kills++;
							
						else if (event.victimId == participant.participantId)
							player.scores.deaths++;

						else if (event.assistingParticipantIds.indexOf(participant.participantId) >= 0)
							player.scores.assists++;
					}
					console.log(`An event occurred: ${killer?.player.summonerName} (assists: ${assistants?.map(a => a?.player.summonerName).join("/")}) killed ${victim?.player.summonerName}.`);
					break;
				}

				case "WARD_PLACED":
				case "WARD_KILL": {
					// TODO: Update ward score
					switch (event.wardType) {
						case "UNDEFINED":
						case "TEEMO_MUSHROOM":
							break;

						default:
							debugger;
					}
					break;
				}

				case "BUILDING_KILL": {
					if (event.assistingParticipantIds == null)
						throw "Unexpected null assistingParticipantIds in BUILDING_KILL";

					// Check if player was on the killing team
					const player = this.data.allPlayers.find(p => p.summonerName == this.data?.activePlayer?.summonerName);
					if (player == null)
						break;

					const playerIsBlueTeam = player.team == "ORDER";
					let killer = this.options?.match.participants.find(p => p.participantId == event.killerId);
					if (killer == null)
						continue;

					let killerIsBlueTeam = killer.teamId == 100;
					if (killerIsBlueTeam != playerIsBlueTeam)
						continue;

					// Determine gold amounts
					let globalGold = 0;
					let localGold = 0;
					switch (event.buildingType) {
						case "TOWER_BUILDING": {
							if (this.options?.match.gameMode == "ARAM") {
								globalGold = 150;
								localGold = 0;
							}
							else {
								debugger; // TODO: verify global gold amount
							}
							break;
						}

						default:
							localGold = 50;
							debugger;
							break;
					}

					this.goldCounter += globalGold;

					// Check if we should give local gold
					if (localGold != 0) {
						let killerId = this.options?.match.participantIdentities.find(p => p.participantId == event.killerId);
						if (killerId && killerId.player.summonerName == player.summonerName) {
							this.goldCounter += localGold;
							break;
						}

						let assistants = event.assistingParticipantIds.map(id => this.options?.match.participantIdentities.find(p => p.participantId == id));
						for (let assistant of assistants) {
							if (assistant == null || assistant.player.summonerName != player.summonerName)
								continue;

							this.goldCounter += localGold;
							break;
						}
					}
					break;
				}

				default:
					console.log(`An event occurred: ${event.type} at ${event.timestamp}`);
					debugger;
			}
		}
		
		if (this.data.activePlayer) {
			const goldPerSec = 3;
			this.goldCounter += goldPerSec * deltaSec;
			this.data.activePlayer.currentGold = Math.floor(this.goldCounter);
		}

		if (this.options?.verbose) {
			console.log(`Game time: ${Math.floor(gameTimeMS / 1000)}`);
		}
	}

	get allData() {
		this.update();
		return this.data;
	}

	get isRunning() {
		return this.startTime > 0;
	}

	get activePlayer() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not been initialised!";
		if (this.data.activePlayer == null)
			return this.getError(400, "RPC_ERROR", "Spectator mode doesn't currently support this feature");
		return this.data.activePlayer;
	}

	get activePlayerName() {
		if (this.data == null || this.data.activePlayer == null)
			return "";

		return this.data.activePlayer.summonerName;
	}

	get activePlayerAbilities() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not been initialised!";
		if (this.data.activePlayer == null)
			return this.getError(400, "RPC_ERROR", "Spectator mode doesn't currently support this feature");

		return this.data.activePlayer.abilities;
	}

	get activePlayerRunes() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not been initialised!";
		if (this.data.activePlayer == null)
			return this.getError(400, "RPC_ERROR", "Spectator mode doesn't currently support this feature");

		return this.data.activePlayer.fullRunes;
	}

	get allPlayers() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not been initialised!";
		if (this.data.activePlayer == null)
			return this.getError(400, "RPC_ERROR", "Spectator mode doesn't currently support this feature");

		return this.data.allPlayers;
	}

	get events() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not been initialised!";
		return this.data.events;
	}

	get stats() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not been initialised!";
		return this.data.gameData;
	}

	public getPlayerScore(summonerName: string | undefined) {
		if (summonerName == null)
			return this.getError(400, "BAD_REQUEST", "A value for 'summonerName' is required.");

		const summoner = this.data?.allPlayers.find(p => p.summonerName == summonerName);
		if (summoner == null)
			return this.getError(400, "BAD_REQUEST", "Unable to find player");

		return summoner.scores;
	}

	public getPlayerSummoners(summonerName: string | undefined) {
		if (summonerName == null)
			return this.getError(400, "BAD_REQUEST", "A value for 'summonerName' is required.");

		const summoner = this.data?.allPlayers.find(p => p.summonerName == summonerName);
		if (summoner == null)
			return this.getError(400, "BAD_REQUEST", "Unable to find player");

		return summoner.summonerSpells;
	}

	public getPlayerItems(summonerName: string | undefined) {
		if (summonerName == null)
			return this.getError(400, "BAD_REQUEST", "A value for 'summonerName' is required.");

		const summoner = this.data?.allPlayers.find(p => p.summonerName == summonerName);
		if (summoner == null)
			return this.getError(400, "BAD_REQUEST", "Unable to find player");

		return summoner.items;
	}

	getError(status: number, code: string, error: string) {
		return {
			"errorCode": code,
			"httpStatus": status,
			"message": error
		};
	}
};