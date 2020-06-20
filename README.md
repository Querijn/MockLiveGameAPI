# MockLiveGameAPI
A server that imitates a live game of League of Legends in the background. Useful if you want to develop something using the ingame API, but not while running League of Legends.

## How to install

1. Download this repository
2. Ensure you have NodeJS and NPM.
3. In the root folder, run `npm install && tsc -p .`.

## How to start

You can run the application by running `node dist/index.js`. This will automatically start a EUW1 ARAM game, at 1 on 1 speed. Below are some additional parameters you can add.

## Additional parameters
- `-port/-p <port number>`, although it is not recommended, as the API should always be on 2999.
- `-locale/-l <locale>`, should be a locale in this list: https://ddragon.leagueoflegends.com/cdn/languages.json
- `-patch/-v <ddragon version>`, select a specific version of DDragon to be used. Needs to be in this list: https://ddragon.leagueoflegends.com/api/versions.json
- `-apikey/-k <API key, file or env var>`, supply a Riot Games API key, file or environment variable to download a match with.
- `-match/-m <match id>`, a match id by Riot Games to download with the API key. 
- `-gamespeed/-s <gamespeed multiplier>`, makes time go by faster.
- `-verbose/-v`, outputs data every second in the window.
