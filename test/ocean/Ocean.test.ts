import { assert, spy, use } from "chai"
import * as spies from "chai-spies"

import { SearchQuery } from "../../src/aquarius/query/SearchQuery"
import { DDO } from "../../src/ddo/DDO"
import Account from "../../src/ocean/Account"
import { Ocean } from "../../src/ocean/Ocean"
import * as signatureHelpers from "../../src/utils/SignatureHelpers"
import config from "../config"
import TestContractHandler from "../keeper/TestContractHandler"
import { metadataMock } from "../testdata/MetaData"

use(spies)

let ocean: Ocean
let accounts: Account[]
let testPublisher: Account

describe("Ocean", () => {

    const metadata = metadataMock

    beforeEach(async () => {
        spy.on(signatureHelpers, "signText", () => `0x${"a".repeat(130)}`)
    })
    afterEach(() => {
        spy.restore()
    })

    before(async () => {
        await TestContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.accounts.list()

        testPublisher = accounts[0]
    })

    describe("#getInstance()", () => {
        it("should get an instance of cean", async () => {

            const oceanInstance: Ocean = await Ocean.getInstance(config)

            assert(oceanInstance)
        })
    })

    describe("#getAccounts()", () => {
        it("should list accounts", async () => {

            const accs: Account[] = await ocean.accounts.list()

            assert(10 === accs.length)
            assert(0 === (await accs[5].getBalance()).ocn)
            assert("string" === typeof accs[0].getId())
        })
    })

    describe("#searchAssets()", () => {
        it("should search for assets", async () => {
            const query = {
                offset: 100,
                page: 0,
                query: {
                    value: 1,
                },
                sort: {
                    value: 1,
                },
                text: "Office",
            } as SearchQuery

            const assets: any[] = await ocean.assets.query(query)

            assert(assets)
        })
    })

    describe("#searchAssetsByText()", () => {
        it("should search for assets", async () => {
            const text = "office"
            const assets: any[] = await ocean.assets.search(text)

            assert(assets)
        })
    })
})
