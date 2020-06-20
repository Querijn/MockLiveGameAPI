/// <reference path="../../types/live_game.d.ts"/>
/// <reference path="../../types/ddragon_item.d.ts"/>

import LiveGamePlayer from "./player";

export default class LiveGameActivePlayer implements LiveGameAPI.ActivePlayer {

	public abilities: { [key: string]: LiveGameAPI.Ability };
	public championStats: LiveGameAPI.ChampionStats;
	public currentGold: number;
	public fullRunes: LiveGameAPI.FullRunes;
	public level: number;
	public summonerName: string;

	constructor(player: LiveGameAPI.ActivePlayer) {
		this.abilities = player.abilities;
		this.championStats = player.championStats;
		this.currentGold = player.currentGold;
		this.fullRunes = player.fullRunes;
		this.level = player.level;
		this.summonerName = player.summonerName;
	}

	public spendGold(player: LiveGamePlayer, itemId: string, itemDatabase: DDragonItem.JSON) {
		const item = itemDatabase.data[itemId];
		if (item.gold == null) { // This item has no cost.
			debugger;
			return;
		}

		if (item.from == null || item.from.length == 0) { // This item has no components
			this.currentGold -= item.gold.total;
			return;
		}
		
		// Find each component that would go into this item.
		// Remove them from the inventory.
		let goldTotal = item.gold.total;
		for (let i = 0; i < player.items.length;) {
			const invItem = player.items[i];
			if (item.from.indexOf(invItem.itemID.toString()) < 0) {
				i++;
				continue;
			}

			player.items.splice(i, 1);
			const invItemData = itemDatabase.data[invItem.itemID];
			if (invItemData.gold == null)
				continue;

			goldTotal -= invItemData.gold.total;
		}

		this.currentGold -= goldTotal;
	}

	public refundGold(player: LiveGamePlayer, itemId: string, itemDatabase: DDragonItem.JSON, sold: boolean) {
		debugger;
	}
}