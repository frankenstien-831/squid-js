import * as HDWalletProvider from "truffle-hdwallet-provider"
import Config from "../models/Config"
import * as config from "./config/config.json"

if (process.env.SEED_WORDS) {
    const seedphrase = process.env.SEED_WORDS
    // There are 20 accounts availabe (19 + 1)
    const accountIndex = Math.floor(Math.random() * 19)

    // @ts-ignore
    config.web3Provider = new HDWalletProvider(
        seedphrase,
        config.nodeUri,
        accountIndex,
        2,
    )
}

export default config as Config
