import { assert } from "chai"
import * as Web3 from "web3"

import { config } from "../config"

import { Ocean, Account, DDO } from "../../src" // @oceanprotocol/squid

// WARN: not integration test. It has been done here because constant values
// depends on the first account on spree (only accessible from integration test)
describe("Signature", () => {

    let ocean: Ocean
    let consumer: Account

    before(async () => {
        ocean = await Ocean.getInstance({
            ...config,
            web3Provider: new (Web3 as any).providers
                .HttpProvider("http://localhost:8545", 0, "0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e", "node0"),
        })

        // Accounts
        consumer = new Account("0x00bd138abd70e2f00903268f3db08f2d25677c9e")
        consumer.setPassword("node0")
    })

    it("should generate the correct signature", async () => {
        const templateId = `0x${"f".repeat(40)}`
        const agreementId = `0x${"e".repeat(64)}`

        const accessId = `0x${"a".repeat(64)}`
        const lockId = `0x${"b".repeat(64)}`
        const escrowId = `0x${"c".repeat(64)}`

        const hash = await ocean.utils.agreements.hashServiceAgreement(
            templateId,
            agreementId,
            [accessId, lockId, escrowId],
            [0, 0, 0],
            [0, 0, 0],
        )

        assert.equal(hash, "0x67901517c18a3d23e05806fff7f04235cc8ae3b1f82345b8bfb3e4b02b5800c7", "The signatuere is not correct.")
    })

    it("should generate the correct signature", async () => {
        const templates = ocean.keeper.templates

        const did = `did:op:${"c".repeat(64)}`
        const templateId = `0x${"f".repeat(40)}`
        const agreementId = `0x${"e".repeat(64)}`
        const serviceDefinitionId = "0"

        const serviceAgreementTemplate = await templates.escrowAccessSecretStoreTemplate.getServiceAgreementTemplate()

        const ddo = new DDO({
            id: did,
            service: [
                {
                    type: "Access",
                    purchaseEndpoint: undefined,
                    serviceEndpoint: undefined,
                    serviceDefinitionId,
                    templateId,
                    serviceAgreementTemplate,
                } as any,
                {
                    type: "Metadata",
                    metadata: {
                        base: {
                            price: 10,
                        },
                    },
                } as any,
            ],
        })

        const agreementConditionIds = await templates.escrowAccessSecretStoreTemplate
            .getAgreementIdsFromDDO(agreementId, ddo, consumer.getId(), consumer.getId())

        const signature = await ocean.utils.agreements.signServiceAgreement(
            ddo,
            serviceDefinitionId,
            agreementId,
            agreementConditionIds,
            consumer,
        )

        assert.equal(
            signature,
            // tslint:disable-next-line
            "0x2164dd54b1df9908b3aa31a2d195c3e3a244ff62b51b0403958234f50cb313615ac5ca6660f7a76957612deeca84e6953f2ce74f56def351d9eb0f155a4eddff1c",
            "The signatuere is not correct.",
        )
    })
})
