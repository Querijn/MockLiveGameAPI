import fetch from "node-fetch";

export namespace DDragon {
	export function request(file: string, version: string, locale: string) {
		return fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/${file}`);
	}
	
	export async function getAllVersions(): Promise<string[]> {
		const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
		return response.ok ? await response.json() : [];
	}
}
