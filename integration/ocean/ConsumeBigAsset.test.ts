import { assert } from "chai"
import * as fs from "fs"

import { config } from "../config"
import { getMetadata } from "../utils"

import { Ocean, Account, DDO } from "../../src" // @oceanprotocol/squid

// Ensure that your network is fast enought and you have some free ram before run it.
xdescribe("Consume Asset (Large size)", () => {
    let ocean: Ocean

    let publisher: Account
    let consumer: Account

    let ddo: DDO
    let agreementId: string

    const baseMetadata = getMetadata()
    const metadata = {
        ...baseMetadata,
        base: {
            ...baseMetadata.base,
            files: [ {
                url: "https://speed.hetzner.de/1GB.bin",
            }],
        },
    }

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        publisher = (await ocean.accounts.list())[0]
        consumer = (await ocean.accounts.list())[1]
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

        assert.deepEqual(files, ["file-0"], "Stored files are not correct.")
        // assert.deepEqual(files, ["1GB.bin"], "Stored files are not correct.")
    })
})
