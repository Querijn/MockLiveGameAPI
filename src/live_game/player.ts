/// <reference path="../../types/live_game.d.ts"/>

export default class LiveGamePlayer implements LiveGameAPI.Player {

	public championName: string;
	public isBot: boolean;
	public isDead: boolean;
	public items: LiveGameAPI.Item[];
	public level: number;
	public position: string;
	public rawChampionName: string;
	public rawSkinName?: string;
	public respawnTimer: number;
	public runes: LiveGameAPI.Runes;
	public scores: LiveGameAPI.Scores;
	public skinID: number;
	public skinName?: string;
	public summonerName: string;
	public summonerSpells: LiveGameAPI.SummonerSpells;
	public team: "ORDER" | "CHAOS";
	
	constructor(player: LiveGameAPI.Player) {
		this.championName = player.championName;
		this.isBot = player.isBot;
		this.isDead = player.isDead;
		this.items = player.items;
		this.level = player.level;
		this.position = player.position;
		this.rawChampionName = player.rawChampionName;
		this.rawSkinName = player.rawSkinName;
		this.respawnTimer = player.respawnTimer;
		this.runes = player.runes;
		this.scores = player.scores;
		this.skinID = player.skinID;
		this.skinName = player.skinName;
		this.summonerName = player.summonerName;
		this.summonerSpells = player.summonerSpells;
		this.team = player.team;
	}

	addItem(itemId: string, item: DDragonItem.Item) {

		// First see if we can increment the inventory spot as a stackable.
		const inventorySpot = this.items.find(i => i.itemID.toString() == itemId.toString());
		if (inventorySpot) {
			if (inventorySpot.count >= (item.stacks || 1)) {
				console.warn(`Tried to buy another "${item.name}", while we can't have more than ${(item.stacks || 1)}.`);
				return;
			}

			inventorySpot.count++;
			return;
		}

		// Add to inventory
		this.items.push({
			canUse: item.consumed || false, // TODO: Verify
			consumable: item.consumed || false, // TODO: Verify
			count: 1,
			displayName: item.name,
			itemID: parseInt(itemId),
			price: item.gold?.total || 0,
			rawDescription: "", // TODO
			rawDisplayName: "", // TODO
			slot: this.items.length
		});
	}

	removeItem(itemId: string, item: DDragonItem.Item) {

		const inventorySpotIndex = this.items.findIndex(i => i.itemID.toString() == itemId.toString());

		// First see if we can decrement the inventory spot as a stackable.
		if (inventorySpotIndex >= 0) {
			const inventorySpot = this.items[inventorySpotIndex];
			inventorySpot.count--;

			if (inventorySpot.count == 0)
				this.items.splice(inventorySpotIndex, 1);
			return;
		}

		// Add to inventory
		this.items.push({
			canUse: item.consumed || false, // TODO: Verify
			consumable: item.consumed || false, // TODO: Verify
			count: 1,
			displayName: item.name,
			itemID: parseInt(itemId),
			price: item.gold?.total || 0,
			rawDescription: "", // TODO
			rawDisplayName: "", // TODO
			slot: this.items.length
		});
	}
}