import { assert } from "chai"

import { config } from "../config"

import { Ocean, Account, DDO } from "../../src" // @oceanprotocol/squid

// WARN: not integration test. It has been done here because constant values
// depends on the first account on spree (only accessible from integration test)
describe("Signature", () => {

    let ocean: Ocean
    let consumer: Account

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        consumer = (await ocean.accounts.list())[0]
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

        const signature = await ocean.utils.agreements.signServiceAgreement(
            ddo,
            serviceDefinitionId,
            agreementId,
            [`0x${"1".repeat(64)}`, `0x${"2".repeat(64)}`, `0x${"3".repeat(64)}`],
            consumer,
        )

        assert.equal(
            signature,
            // tslint:disable-next-line
            "0x3aa8a1c48b8e582d694bbd4ba3a29fde573b78da9720dc48baeb831b2163e1fa6e10e983882ebf8a00f4124de2505136354fd146934053f0d58bba4eced5f8d000",
            "The signatuere is not correct.",
        )
    })
})
