declare module DDragonItem {

	export interface Rune {
		isrune: boolean;
		tier: number;
		type: string;
	}

	export interface Gold {
		base: number;
		total: number;
		sell: number;
		purchasable: boolean;
	}

	export interface Stats {
		FlatHPPoolMod?: number;
		rFlatHPModPerLevel?: number;
		FlatMPPoolMod?: number;
		rFlatMPModPerLevel?: number;
		PercentHPPoolMod?: number;
		PercentMPPoolMod?: number;
		FlatHPRegenMod?: number;
		rFlatHPRegenModPerLevel?: number;
		PercentHPRegenMod?: number;
		FlatMPRegenMod?: number;
		rFlatMPRegenModPerLevel?: number;
		PercentMPRegenMod?: number;
		FlatArmorMod?: number;
		rFlatArmorModPerLevel?: number;
		PercentArmorMod?: number;
		rFlatArmorPenetrationMod?: number;
		rFlatArmorPenetrationModPerLevel?: number;
		rPercentArmorPenetrationMod?: number;
		rPercentArmorPenetrationModPerLevel?: number;
		FlatPhysicalDamageMod?: number;
		rFlatPhysicalDamageModPerLevel?: number;
		PercentPhysicalDamageMod?: number;
		FlatMagicDamageMod?: number;
		rFlatMagicDamageModPerLevel?: number;
		PercentMagicDamageMod?: number;
		FlatMovementSpeedMod?: number;
		rFlatMovementSpeedModPerLevel?: number;
		PercentMovementSpeedMod?: number;
		rPercentMovementSpeedModPerLevel?: number;
		FlatAttackSpeedMod?: number;
		PercentAttackSpeedMod?: number;
		rPercentAttackSpeedModPerLevel?: number;
		rFlatDodgeMod?: number;
		rFlatDodgeModPerLevel?: number;
		PercentDodgeMod?: number;
		FlatCritChanceMod?: number;
		rFlatCritChanceModPerLevel?: number;
		PercentCritChanceMod?: number;
		FlatCritDamageMod?: number;
		rFlatCritDamageModPerLevel?: number;
		PercentCritDamageMod?: number;
		FlatBlockMod?: number;
		PercentBlockMod?: number;
		FlatSpellBlockMod?: number;
		rFlatSpellBlockModPerLevel?: number;
		PercentSpellBlockMod?: number;
		FlatEXPBonus?: number;
		PercentEXPBonus?: number;
		rPercentCooldownMod?: number;
		rPercentCooldownModPerLevel?: number;
		rFlatTimeDeadMod?: number;
		rFlatTimeDeadModPerLevel?: number;
		rPercentTimeDeadMod?: number;
		rPercentTimeDeadModPerLevel?: number;
		rFlatGoldPer10Mod?: number;
		rFlatMagicPenetrationMod?: number;
		rFlatMagicPenetrationModPerLevel?: number;
		rPercentMagicPenetrationMod?: number;
		rPercentMagicPenetrationModPerLevel?: number;
		FlatEnergyRegenMod?: number;
		rFlatEnergyRegenModPerLevel?: number;
		FlatEnergyPoolMod?: number;
		rFlatEnergyModPerLevel?: number;
		PercentLifeStealMod?: number;
		PercentSpellVampMod?: number;
	}

	export interface Item {
		name: string;
		rune: Rune;
		gold?: Gold;
		group?: string;
		description: string;
		colloq: string;
		plaintext: string;
		consumed?: boolean;
		stacks?: number;
		depth?: number;
		consumeOnFull?: boolean;
		from?: string[];
		into?: string[];
		specialRecipe?: number;
		inStore?: boolean;
		hideFromAll?: boolean;
		requiredChampion?: string;
		requiredAlly?: string;
		stats: Stats;
		tags: any[];
		maps?: { [mapId: string]: boolean };
	}

	export interface JSON {
		type: string;
		version: string;
		data: { [itemId: string]: Item };
	}

}

