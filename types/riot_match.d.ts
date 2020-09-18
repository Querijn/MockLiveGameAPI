declare module RiotAPI {

	export interface Team {
		teamId: 100 | 200;
		win: string;
		firstBlood: boolean;
		firstTower: boolean;
		firstInhibitor: boolean;
		firstBaron: boolean;
		firstDragon: boolean;
		firstRiftHerald: boolean;
		towerKills: number;
		inhibitorKills: number;
		baronKills: number;
		dragonKills: number;
		vilemawKills: number;
		riftHeraldKills: number;
		dominionVictoryScore: number;
		bans: any[];
	}

	export interface Stats {
		participantId: number;
		win: boolean;
		item0: number;
		item1: number;
		item2: number;
		item3: number;
		item4: number;
		item5: number;
		item6: number;
		kills: number;
		deaths: number;
		assists: number;
		largestKillingSpree: number;
		largestMultiKill: number;
		killingSprees: number;
		longestTimeSpentLiving: number;
		doubleKills: number;
		tripleKills: number;
		quadraKills: number;
		pentaKills: number;
		unrealKills: number;
		totalDamageDealt: number;
		magicDamageDealt: number;
		physicalDamageDealt: number;
		trueDamageDealt: number;
		largestCriticalStrike: number;
		totalDamageDealtToChampions: number;
		magicDamageDealtToChampions: number;
		physicalDamageDealtToChampions: number;
		trueDamageDealtToChampions: number;
		totalHeal: number;
		totalUnitsHealed: number;
		damageSelfMitigated: number;
		damageDealtToObjectives: number;
		damageDealtToTurrets: number;
		visionScore: number;
		timeCCingOthers: number;
		totalDamageTaken: number;
		magicalDamageTaken: number;
		physicalDamageTaken: number;
		trueDamageTaken: number;
		goldEarned: number;
		goldSpent: number;
		turretKills: number;
		inhibitorKills: number;
		totalMinionsKilled: number;
		neutralMinionsKilled: number;
		totalTimeCrowdControlDealt: number;
		champLevel: number;
		visionWardsBoughtInGame: number;
		sightWardsBoughtInGame: number;
		firstBloodKill: boolean;
		firstBloodAssist: boolean;
		firstTowerKill: boolean;
		firstTowerAssist: boolean;
		firstInhibitorKill: boolean;
		firstInhibitorAssist: boolean;
		combatPlayerScore: number;
		objectivePlayerScore: number;
		totalPlayerScore: number;
		totalScoreRank: number;
		playerScore0: number;
		playerScore1: number;
		playerScore2: number;
		playerScore3: number;
		playerScore4: number;
		playerScore5: number;
		playerScore6: number;
		playerScore7: number;
		playerScore8: number;
		playerScore9: number;
		perk0: number;
		perk0Var1: number;
		perk0Var2: number;
		perk0Var3: number;
		perk1: number;
		perk1Var1: number;
		perk1Var2: number;
		perk1Var3: number;
		perk2: number;
		perk2Var1: number;
		perk2Var2: number;
		perk2Var3: number;
		perk3: number;
		perk3Var1: number;
		perk3Var2: number;
		perk3Var3: number;
		perk4: number;
		perk4Var1: number;
		perk4Var2: number;
		perk4Var3: number;
		perk5: number;
		perk5Var1: number;
		perk5Var2: number;
		perk5Var3: number;
		perkPrimaryStyle: number;
		perkSubStyle: number;
		statPerk0: number;
		statPerk1: number;
		statPerk2: number;
	}

	export interface Timeline {
		participantId: number;
		creepsPerMinDeltas: { [timeKey: string]: number };
		xpPerMinDeltas: { [timeKey: string]: number };
		goldPerMinDeltas: { [timeKey: string]: number };
		damageTakenPerMinDeltas: { [timeKey: string]: number };
		role: string;
		lane: string;
	}

	export interface Participant {
		participantId: number;
		teamId: 100 | 200;
		championId: number;
		spell1Id: number;
		spell2Id: number;
		stats: Stats;
		timeline: Timeline;
	}

	export interface Player {
		platformId: string;
		accountId: string;
		summonerName: string;
		summonerId: string;
		currentPlatformId: string;
		currentAccountId: string;
		matchHistoryUri: string;
		profileIcon: number;
	}

	export interface ParticipantIdentity {
		participantId: number;
		player: Player;
	}

	export interface Match {
		gameId: number;
		platformId: string;
		gameCreation: number;
		gameDuration: number;
		queueId: number;
		mapId: number;
		seasonId: number;
		gameVersion: string;
		gameMode: string;
		gameType: string;
		teams: Team[];
		participants: Participant[];
		participantIdentities: ParticipantIdentity[];
	}

	export interface Position {
		x: number;
		y: number;
	}

	export interface Event {
		type: "CHAMPION_KILL" | "WARD_PLACED" | "WARD_KILL" | "BUILDING_KILL" | "ELITE_MONSTER_KILL" | "ITEM_PURCHASED" | "ITEM_SOLD" | "ITEM_DESTROYED" | "ITEM_UNDO" | "SKILL_LEVEL_UP" | "ASCENDED_EVENT" | "CAPTURE_POINT" | "PORO_KING_SUMMON";
		timestamp: number;

		eventType?: string;
		position?: Position;
		participantId?: number;

		levelUpType: string;
		skillSlot?: number;

		buildingType: string;
		laneType?: string;
		ascendedType?: string;
		creatorId?: number;
		afterId?: number;
		wardType?: string;
		towerType?: string;
		itemId?: number;
		beforeId?: number;
		pointCaptured?: string;
		monsterType?: string;
		monsterSubType?: string;
		teamId?: 100 | 200;
		assistingParticipantIds?: number[];
		killerId?: number;
		victimId?: number;
	}

	export interface ParticipantFrame {
		participantId: number;
		position: Position;
		currentGold: number;
		totalGold: number;
		level: number;
		xp: number;
		minionsKilled: number;
		jungleMinionsKilled: number;
		dominionScore: number;
		teamScore: number;
	}

	export interface Frame {
		participantFrames: { [id: string]: ParticipantFrame };
		events: Event[];
		timestamp: number;
	}

	export interface MatchTimeline {
		frames: Frame[];
		frameInterval: number;
	}
}
