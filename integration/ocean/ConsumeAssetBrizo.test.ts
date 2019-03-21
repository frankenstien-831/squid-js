import { assert } from "chai"
import * as Web3 from "web3"
import * as fs from "fs"

import { config } from "../config"
import { getMetadata } from "../utils"

import { Ocean, Account, DDO } from "../../src" // @oceanprotocol/squid

describe("Consume Asset (Brizo)", () => {
    let ocean: Ocean

    let publisher: Account
    let consumer: Account

    let ddo: DDO
    let agreementId: string

    const metadata = getMetadata()

    before(async () => {
        ocean = await Ocean.getInstance({
            ...config,
            web3Provider: new Web3.providers
                .HttpProvider("http://localhost:8545", 0, "0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e", "node0"),
        })

        // Accounts
        const instanceConfig = (<any>ocean).instanceConfig
        publisher = new Account("0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e", instanceConfig)
        publisher.setPassword("node0")
        consumer = new Account("0x068Ed00cF0441e4829D9784fCBe7b9e26D4BD8d0", instanceConfig)
        consumer.setPassword("secret")
    })

    it("should regiester an asset", async () => {
        ddo = await ocean.assets.create(metadata as any, publisher)

        assert.instanceOf(ddo, DDO)
    })

    it("should order the asset", async () => {
        const accessService = ddo.findServiceByType("Access")

        await consumer.requestTokens(metadata.base.price)

        agreementId = await ocean.assets.order(ddo.id, accessService.serviceDefinitionId, consumer)

        assert.isDefined(agreementId)
    })

    it("should consume and store the assets", async () => {
        const accessService = ddo.findServiceByType("Access")

        const folder = "/tmp/ocean/squid-js"
        const path = await ocean.assets.consume(agreementId, ddo.id, accessService.serviceDefinitionId, consumer, folder)

        assert.include(path, folder, "The storage path is not correct.")

        const files = await new Promise<string[]>((resolve) => {
            fs.readdir(path, (err, fileList) => {
                resolve(fileList)
            })
        })

        assert.deepEqual(files, ["README.md", "package.json"], "Stored files are not correct.")
    })
})
