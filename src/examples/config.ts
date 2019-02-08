import * as HDWalletProvider from "truffle-hdwallet-provider"
import Config from "../models/Config"
import * as config from "./config/config.json"

if (process.env.SEED_WORDS) {
    const seedphrase = process.env.SEED_WORDS

    // @ts-ignore
    config.web3Provider = new HDWalletProvider(
        seedphrase,
        config.nodeUri,
        0,
        2,
    )
}

export default config as Config
