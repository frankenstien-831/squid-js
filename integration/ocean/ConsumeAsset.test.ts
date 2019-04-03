import { assert } from "chai"
import * as fs from "fs"

import { config } from "../config"
import { getMetadata } from "../utils"

import { Ocean, DDO, Account } from "../../src" // @oceanprotocol/squid

describe("Consume Asset", () => {
    let ocean: Ocean

    let publisher: Account
    let consumer: Account

    const metadata = getMetadata()

    let ddo: DDO
    let serviceAgreementSignatureResult: {agreementId: string, signature: string}

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        publisher = (await ocean.accounts.list())[0]
        consumer = (await ocean.accounts.list())[1]
    })

    it("should regiester a asset", async () => {
        ddo = await ocean.assets.create(metadata as any, publisher)

        assert.isDefined(ddo, "Register has not returned a DDO")
        assert.match(ddo.id, /^did:op:[a-f0-9]{64}$/, "DDO id is not valid")
        assert.isAtLeast(ddo.authentication.length, 1, "Default authentication not added")
        assert.isDefined(ddo.findServiceByType("Access"), "DDO Access service doesn't exist")
    })

    it("should be able to request tokens for consumer", async () => {
        const initialBalance = (await consumer.getBalance()).ocn
        await consumer.requestTokens(metadata.base.price)

        assert.equal((await consumer.getBalance()).ocn, initialBalance + metadata.base.price, "OCN Tokens not delivered")
    })

    it("should sign the service agreement", async () => {
        const accessService = ddo.findServiceByType("Access")

        serviceAgreementSignatureResult = await ocean.agreements.prepare(ddo.id, accessService.serviceDefinitionId, consumer)

        const {agreementId, signature} = serviceAgreementSignatureResult
        assert.match(agreementId, /^[a-f0-9]{64}$/, "Service agreement ID seems not valid")
        assert.match(signature, /^0x[a-f0-9]{130}$/, "Service agreement signature seems not valid")
    })

    it("should execute the service agreement", async () => {
        const accessService = ddo.findServiceByType("Access")

        const success = await ocean.agreements.create(
            ddo.id,
            serviceAgreementSignatureResult.agreementId,
            accessService.serviceDefinitionId,
            serviceAgreementSignatureResult.signature,
            consumer,
            publisher,
        )

        assert.isTrue(success)
    })

    it("should lock the payment by the consumer", async () => {
        const paid = await ocean.agreements.conditions
            .lockReward(
                serviceAgreementSignatureResult.agreementId,
                ddo.findServiceByType("Metadata").metadata.base.price,
                consumer,
            )

        assert.isTrue(paid, "The asset has not been paid correctly")
    })

    it("should grant the access by the publisher", async () => {
        const granted = await ocean.agreements.conditions
            .grantAccess(serviceAgreementSignatureResult.agreementId, ddo.id, consumer.getId(), publisher)

        assert.isTrue(granted, "The asset has not been granted correctly")

        const accessGranted = await ocean.keeper.conditions
            .accessSecretStoreCondition
            .checkPermissions(consumer.getId(), ddo.id)

        assert.isTrue(accessGranted, "Consumer has been granted.")
    })

    it("should consume and store the assets", async () => {
        const accessService = ddo.findServiceByType("Access")

        const folder = "/tmp/ocean/squid-js-1"
        const path = await ocean.assets.consume(
            serviceAgreementSignatureResult.agreementId,
            ddo.id,
            accessService.serviceDefinitionId,
            consumer,
            folder,
        )

        assert.include(path, folder, "The storage path is not correct.")

        const files = await new Promise<string[]>((resolve) => {
            fs.readdir(path, (err, fileList) => {
                resolve(fileList)
            })
        })

        assert.deepEqual(files, ["file-0", "file-1"], "Stored files are not correct.")
        // assert.deepEqual(files, ["README.md", "package.json"], "Stored files are not correct.")
    })

    it("should consume and store one assets", async () => {
        const accessService = ddo.findServiceByType("Access")

        const folder = "/tmp/ocean/squid-js-2"
        const path = await ocean.assets.consume(
            serviceAgreementSignatureResult.agreementId,
            ddo.id,
            accessService.serviceDefinitionId,
            consumer,
            folder,
            1,
        )

        assert.include(path, folder, "The storage path is not correct.")

        const files = await new Promise<string[]>((resolve) => {
            fs.readdir(path, (err, fileList) => {
                resolve(fileList)
            })
        })

        assert.deepEqual(files, ["file-1"], "Stored files are not correct.")
        // assert.deepEqual(files, ["package.json"], "Stored files are not correct.")
    })
})
