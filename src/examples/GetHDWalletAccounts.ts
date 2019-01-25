import {Logger, Ocean} from "../squid"
import config from "./config"
import {runner} from "./runner"

async function exec() {
    const ocean: Ocean = await Ocean.getInstance(config)

    const accounts = await ocean.getAccounts()

    Logger.log(JSON.stringify(accounts, null, 2))
}

runner(exec)
