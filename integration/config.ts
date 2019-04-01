import * as HDWalletProvider from "truffle-hdwallet-provider"
import { Config } from "../src"

const configJson: Config = {
  "nodeUri": "http://localhost:8545",
  "aquariusUri": "http://172.15.0.15:5000",
  "brizoUri": "http://localhost:8030", //"https://brizo-ha.dev-ocean.com",
  "brizoAddress": "0x00bd138abd70e2f00903268f3db08f2d25677c9e", // "0x413c9ba0a05b8a600899b41b0c62dd661e689354",
  "secretStoreUri": "https://secret-store.dev-ocean.com/",
  "verbose": false
}

if (process.env.SEED_WORDS) {
    const seedphrase = process.env.SEED_WORDS

    // @ts-ignore
    configJson.web3Provider = new HDWalletProvider(
        seedphrase,
        configJson.nodeUri,
        0,
        5,
    )
}

export const config: Config = configJson as any
