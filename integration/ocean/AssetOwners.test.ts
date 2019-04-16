import { assert } from "chai"

import { config } from "../config"

import { getMetadata } from "../utils"

import { Ocean, Account } from "../../src" // @oceanprotocol/squid

describe.only("Asset Owners", () => {
    let ocean: Ocean

    let account1: Account
    let account2: Account

    const metadata = getMetadata()

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        const accounts = await ocean.accounts.list()
        account1 = accounts[0]
        account2 = accounts[1]
    })

    it("should be set correctly the owner of a asset", async () => {
        const ddo = await ocean.assets.create(metadata as any, account1)

        const owner = await ocean.assets.owner(ddo.id)

        assert.equal(owner, account1.getId())
    })

    it("should get the assets owned by a user", async () => {
        const {length: initialLength} = await ocean.assets.ownerAssets(account2.getId())

        await ocean.assets.create(metadata as any, account1)
        await ocean.assets.create(metadata as any, account1)

        await ocean.assets.create(metadata as any, account2)

        const {length: finalLength} = await ocean.assets.ownerAssets(account2.getId())

        assert.equal(finalLength - initialLength, 1)
    })
})
