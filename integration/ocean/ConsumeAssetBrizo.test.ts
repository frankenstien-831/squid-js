import { assert } from "chai"
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
        ocean = await Ocean.getInstance(config)

        // Accounts
        publisher = (await ocean.accounts.list())[0]
        consumer = (await ocean.accounts.list())[1]
    })

    after(() => {
        try {
            localStorage.clear()
        } catch { }
    })

    it("should authenticate the accounts", async () => {
        await publisher.authenticate()
        await consumer.authenticate()
    })

    it("should regiester an asset", async () => {
        const steps = []
        ddo = await ocean.assets.create(metadata as any, publisher)
            .next((step) => steps.push(step))

        assert.instanceOf(ddo, DDO)
        assert.deepEqual(steps, [0, 1, 2, 3, 4, 5, 6, 7])
    })

    it("should order the asset", async () => {
        const accessService = ddo.findServiceByType("Access")

        await consumer.requestTokens(+metadata.base.price * (10 ** -await ocean.keeper.token.decimals()))

        const steps = []
        agreementId = await ocean.assets.order(ddo.id, accessService.serviceDefinitionId, consumer)
            .next((step) => steps.push(step))

        assert.isDefined(agreementId)
        assert.deepEqual(steps, [0, 1, 2, 3])
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
