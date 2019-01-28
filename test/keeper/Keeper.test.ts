import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import Keeper from "../../src/keeper/Keeper"
import config from "../config"
import TestContractHandler from "./TestContractHandler"

let keeper: Keeper

describe("Keeper", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await TestContractHandler.prepareContracts()
        keeper = await Keeper.getInstance()
    })

    describe("public interface", () => {

        it("should have dispenser", () => {
            assert(keeper.dispenser !== null)
        })

        it("should have auth", () => {
            assert(keeper.auth !== null)
        })

        it("should have token", () => {
            assert(keeper.token !== null)
        })
    })

    describe("#getNetworkName()", () => {

        it("should get development as default", async () => {
            const networkName: string = await keeper.getNetworkName()
            assert(networkName === "Development")
        })

    })
})
