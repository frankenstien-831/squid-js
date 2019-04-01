import * as HDWalletProvider from "truffle-hdwallet-provider"
import { Config } from "../src"

const configJson: Config = {
    nodeUri: "http://localhost:8545",
    aquariusUri: "http://172.15.0.15:5000",
    brizoUri: "http://localhost:8030",
    secretStoreUri: "http://localhost:12001",
    brizoAddress: "0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e",
    verbose: false,
}

if (process.env.NETWORK_NAME === "nile") {
    Object.assign(configJson, {
        nodeUri: "https://nile.dev-ocean.com",
        aquariusUri: "https://nginx-aquarius.dev-ocean.com",
        brizoUri: "https://nginx-brizo.dev-ocean.com",
        secretStoreUri: "https://secret-store.dev-ocean.com/",
        brizoAddress: "0x413c9ba0a05b8a600899b41b0c62dd661e689354",
    })
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
