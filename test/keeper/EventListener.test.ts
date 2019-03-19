import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import EventListener from "../../src/keeper/EventListener"
import Keeper from "../../src/keeper/Keeper"
import Account from "../../src/ocean/Account"
import { Ocean } from "../../src/ocean/Ocean"
import config from "../config"
import TestContractHandler from "./TestContractHandler"

let keeper: Keeper
let ocean: Ocean
let accounts: Account[]

describe("EventListener", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await TestContractHandler.prepareContracts()
        keeper = await Keeper.getInstance()
        assert(keeper)
        ocean = await Ocean.getInstance(config)
        assert(ocean)
        accounts = await ocean.getAccounts()
        assert(accounts)
    })

    describe("#subscribe()", () => {

        it("should subscribe to an event", (done) => {

            const acc = accounts[1]
            const countBefore = EventListener.count()

            const event = EventListener.subscribe("OceanToken",
                "Transfer",
                {
                    to: acc.getId(),
                })
            assert(event)

            const countAfter = EventListener.count()
            assert(countBefore + 1 === countAfter, `${countBefore}${countAfter}`)

            EventListener.unsubscribe(event)
            done()
        })
    })

    describe("#unsubscribe()", () => {

        it("should unsubscribe from an event", (done) => {

            const countBefore = EventListener.count()
            const event = EventListener.subscribe("OceanToken",
                "Transfer",
                {})
            const count = EventListener.count()

            const unsubscribed = EventListener.unsubscribe(event)
            assert(unsubscribed)

            const countAfter = EventListener.count()
            assert(count > countBefore, `${count}${countAfter}`)
            assert(countBefore === countAfter, `${countBefore}${countAfter}`)
            done()
        })
    })

})
