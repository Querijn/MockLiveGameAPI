# MockLiveGameAPI
A mock implementation of League of Legends in-game API. You can use this application to run a server that completely mimics a game of League of Legends running in the background.

## How to install

1. Download this repository
2. Ensure you have NodeJS and NPM.
3. In the root folder, run `npm install && tsc -p `

After this, you can run `node dist/index.js`, but you can append some optional arguments if you wish:
- `-port/-p <port number>`, although it is not recommended, as the API should always be on 2999.
- `-patch/-v <ddragon version>`, select a specific version of DDragon to be used. 
- `-autorun/-r`, automatically starts the game. If you're reading this, this mock implementation is in development and this option is automatically true.
