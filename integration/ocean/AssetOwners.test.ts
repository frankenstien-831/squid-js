import { assert } from "chai"

import { config } from "../config"

import { getMetadata } from "../utils"

import { Ocean, Account } from "../../src" // @oceanprotocol/squid

describe("Asset Owners", () => {
    let ocean: Ocean

    let publisher: Account

    const metadata = getMetadata()

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        publisher = (await ocean.accounts.list())[0]
        publisher.setPassword(process.env.ACCOUNT_PASSWORD)
    })

    it("should be set correctly the owner of a asset", async () => {
        const ddo = await ocean.assets.create(metadata as any, publisher)

        const owner = await ocean.assets.owner(ddo.id)

        assert.equal(owner, publisher.getId())
    })
})
