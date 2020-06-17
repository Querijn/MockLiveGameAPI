/// <reference path="../types/live_game.d.ts"/>
/// <reference path="../types/ddragon_champion.d.ts"/>

import { performance } from "perf_hooks";
import { DDragon } from "./ddragon";

export interface LiveGameOptionsPlayer {
	summonerName?: string;
	champion?: string | number;
	isBot?: boolean;
	level?: number;
	runes?: number[];
	isYou?: boolean;
};

export interface LiveGameOptions {
	patch?: string;
	locale?: string;
	allies: LiveGameOptionsPlayer[];
	enemies?: LiveGameOptionsPlayer[];
	alliedTeamIsRed?: boolean;
	mode?: string;
	map?: number;
};

export class LiveGame {

	private data: LiveGameAPI.Response | null;
	private options: LiveGameOptions | null;
	private startTime: number = 0;
	private lastFrameTime: number = 0;
	private ddragon: DDragonAPI.ChampionJSON | null;
	private goldCounter = 500;

	constructor() {
	}

	get optionsForNextGame() {
		return this.options;
	}

	generateCurrentPlayer(): LiveGameAPI.ActivePlayer | undefined {
		if (this.options == null)
			throw "Unable to generate current player: Cannot initialise game without options!";
		if (this.ddragon == null)
			throw "Unable to generate current player: Cannot initialise game without DDragon!";

		const you = this.options.allies.find(c => c.isYou);
		if (!you) // Basically, fake a replay.
			return;

		const findChampion = you.champion || "Aatrox";
		const championList = Object.values(this.ddragon.data);
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

		return {
			level: 1,
			summonerName: you.summonerName || "Holland",
			currentGold: 500,

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
		};
	}

	generateAllPlayers(): LiveGameAPI.Player[] {
		if (this.options == null)
			throw "Unable to generate current player: Cannot initialise game without options!";
		if (this.ddragon == null)
			throw "Unable to generate current player: Cannot initialise game without DDragon!";

		const players: LiveGameAPI.Player[] = [];
		const alliedTeamIsRed = this.options.alliedTeamIsRed || false;

		const handlePlayer = (player: LiveGameOptionsPlayer, ally: boolean) => {
			const findChampion = player.champion || "Aatrox";
			const championList = Object.values(this.ddragon?.data || {});
			const champion = championList.find(c => c.id === findChampion || c.key === findChampion);
			if (champion == null)
				throw `Unable to generate current player: Unable to identify '${findChampion}' as a champion!`;

			players.push({
				championName: champion.name,
				isBot: player.isBot || false,
				isDead: false,
				items: [],
				level: 0,
				position: "", // ???
				rawChampionName: `game_character_displayname_${champion.id}`,
				respawnTimer: 0,
				runes: {
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
				summonerName: player.summonerName || (player.isBot ? `${champion.name} Bot` : "Holland"),
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
			});
		}

		for (const player of this.options?.allies)
			handlePlayer(player, true);
		for (const player of (this.options?.enemies || []))
			handlePlayer(player, false);

		return players;
	}

	async startGame(options: LiveGameOptions) {
		this.options = options;
		this.lastFrameTime = this.startTime = performance.now();

		const locale = this.options.locale || "en_US";
		const patch = this.options.patch || (await DDragon.getAllVersions())[0]; // latest

		const response = await DDragon.request("championFull.json", patch, locale);
		if (response.ok == false)
			throw "Unable to initialise game, unable to fetch DDragon Champion json file!";
		this.ddragon = <DDragonAPI.ChampionJSON>(await response.json());

		const mapNumber = this.options.map || 11; // Summoner's Rift
		this.data = {
			activePlayer: this.generateCurrentPlayer(),
			allPlayers: this.generateAllPlayers(),
			events: {
				Events: [{
					EventID: 0,
					EventName: "GameStart",
					EventTime: 0,
				}]
			},
			gameData: {
				gameMode: this.options.mode || "CLASSIC",
				gameTime: 0,
				mapName: "Map" + mapNumber,
				mapNumber: mapNumber,
				mapTerrain: "Default"
			}
		};
	}

	update() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not initialised!";

		const deltaSec = (performance.now() - this.lastFrameTime) / 1000;
		this.lastFrameTime = performance.now();
		
		if (this.data.activePlayer) {
			const goldPerSec = 3;
			this.goldCounter += goldPerSec * deltaSec;
			this.data.activePlayer.currentGold = Math.floor(this.goldCounter);
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
			throw "Cannot update LiveGame! It has not initialised!";
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
			throw "Cannot update LiveGame! It has not initialised!";
		if (this.data.activePlayer == null)
			return this.getError(400, "RPC_ERROR", "Spectator mode doesn't currently support this feature");

		return this.data.activePlayer.abilities;
	}

	get activePlayerRunes() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not initialised!";
		if (this.data.activePlayer == null)
			return this.getError(400, "RPC_ERROR", "Spectator mode doesn't currently support this feature");

		return this.data.activePlayer.fullRunes;
	}

	get allPlayers() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not initialised!";
		if (this.data.activePlayer == null)
			return this.getError(400, "RPC_ERROR", "Spectator mode doesn't currently support this feature");

		return this.data.allPlayers;
	}

	get events() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not initialised!";
		return this.data.events;
	}

	get stats() {
		if (this.data == null)
			throw "Cannot update LiveGame! It has not initialised!";
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