declare namespace LiveGameAPI {

	export interface Ability {
		abilityLevel?: number;
		displayName: string;
		id: string;
		rawDescription: string;
		rawDisplayName: string;
	}

	export interface ChampionStats {
		abilityPower: number;
		armor: number;
		armorPenetrationFlat: number;
		armorPenetrationPercent: number;
		attackDamage: number;
		attackRange: number;
		attackSpeed: number;
		bonusArmorPenetrationPercent: number;
		bonusMagicPenetrationPercent: number;
		cooldownReduction: number;
		critChance: number;
		critDamage: number;
		currentHealth: number;
		healthRegenRate: number;
		lifeSteal: number;
		magicLethality: number;
		magicPenetrationFlat: number;
		magicPenetrationPercent: number;
		magicResist: number;
		maxHealth: number;
		moveSpeed: number;
		physicalLethality: number;
		resourceMax: number;
		resourceRegenRate: number;
		resourceType: string;
		resourceValue: number;
		spellVamp: number;
		tenacity: number;
	}

	export interface Rune {
		displayName: string;
		id: number;
		rawDescription: string;
		rawDisplayName: string;
	}

	export interface StatRune {
		id: number;
		rawDescription: string;
	}

	export interface FullRunes {
		generalRunes: Rune[];
		keystone: Rune;
		primaryRuneTree: Rune;
		secondaryRuneTree: Rune;
		statRunes: StatRune[];
	}

	export interface ActivePlayer {
		abilities: { [key: string]: Ability };
		championStats: ChampionStats;
		currentGold: number;
		fullRunes: FullRunes;
		level: number;
		summonerName: string;
	}

	export interface Item {
		canUse: boolean;
		consumable: boolean;
		count: number;
		displayName: string;
		itemID: number;
		price: number;
		rawDescription: string;
		rawDisplayName: string;
		slot: number;
	}

	export interface Runes {
		keystone: Rune;
		primaryRuneTree: Rune;
		secondaryRuneTree: Rune;
	}

	export interface Scores {
		assists: number;
		creepScore: number;
		deaths: number;
		kills: number;
		wardScore: number;
	}

	export interface SummonerSpell {
		displayName: string;
		rawDescription: string;
		rawDisplayName: string;
	}

	export interface SummonerSpells {
		summonerSpellOne: SummonerSpell;
		summonerSpellTwo: SummonerSpell;
	}

	export interface Player {
		championName: string;
		isBot: boolean;
		isDead: boolean;
		items: Item[];
		level: number;
		position: string;
		rawChampionName: string;
		rawSkinName?: string;
		respawnTimer: number;
		runes: Runes;
		scores: Scores;
		skinID: number;
		skinName?: string;
		summonerName: string;
		summonerSpells: SummonerSpells;
		team: "ORDER" | "CHAOS";
	}

	export interface Event {
		EventID: number;
		EventName: string;
		EventTime: number;
	}

	export interface Events {
		Events: Event[];
	}

	export interface GameData {
		gameMode: string;
		gameTime: number;
		mapName: string;
		mapNumber: number;
		mapTerrain: string;
	}

	export interface Response {
		activePlayer?: ActivePlayer;
		allPlayers: Player[];
		events: Events;
		gameData: GameData;
	}

}

