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
        account = new Account("0x068Ed00cF0441e4829D9784fCBe7b9e26D4BD8d0")
        account.setPassword("secret")
    })

    it("should encrypt a text", async () => {
        encryptedContent = await ocean.secretStore.encrypt(did.getId(), content, account)

        assert.isDefined(encryptedContent)
        assert.match(encryptedContent, /^0x[a-f0-9]{86}$/i)
    })

    // Only works running Barge with `--no-acl-contract`
    xit("should decrypt a text", async () => {
        const decryptedContent = await ocean.secretStore.decrypt(did.getId(), encryptedContent, account)

        assert.deepEqual(decryptedContent, content)
    })
})
