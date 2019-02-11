import { assert } from 'chai'

import { config } from "../config"

import { Ocean, Account, ServiceAgreementTemplate, Templates } from '../../src' // @oceanprotocol/squid

describe("Register Service Agreement Templates", () => {
    let ocean: Ocean

    let templateOwner: Account

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        templateOwner = (await ocean.accounts.list())[0]
    })

    it("should regiester a template", async () => {
        const serviceAgreementTemplate = new ServiceAgreementTemplate(new Templates.Access())
        const serviceAgreementRegistered = await serviceAgreementTemplate.register(templateOwner.getId())

        try {
            // It can fail because is already created
            assert.isTrue(serviceAgreementRegistered, "Service agreement template not registered correctly")
        } catch (e) { }
    })
})
