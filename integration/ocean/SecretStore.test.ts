import { assert } from "chai"

import { config } from "../config"

import { Ocean, Account, DID } from "../../src" // @oceanprotocol/squid

describe("Secret Store", () => {
    let ocean: Ocean

    let account: Account

    const did: DID = DID.generate()
    const content = {content: "Test 123"}
    let encryptedContent

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        account = new Account("0xa99d43d86a0758d5632313b8fa3972b6088a21bb")
        account.setPassword("secret")
    })

    it("should encrypt a text", async () => {
        encryptedContent = await ocean.secretStore.encrypt(did.getId(), content, account)

        assert.isDefined(encryptedContent)
        assert.match(encryptedContent, /^0x[a-f0-9]{86}$/i)
    })

    it("should decrypt a text", async () => {
        const decryptedContent = await ocean.secretStore.decrypt(did.getId(), encryptedContent, account)

        assert.deepEqual(decryptedContent, content)
    })
})
