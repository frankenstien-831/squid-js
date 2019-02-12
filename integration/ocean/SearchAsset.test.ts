import { assert } from 'chai'

import { config } from "../config"

import { Ocean, MetaData, Account, DDO } from '../../src' // @oceanprotocol/squid

describe("Search Asset", () => {
    let ocean: Ocean

    let publisher: Account

    const testHash = Math.random().toString(36).substr(2)
    let metadata: Partial<MetaData>
    let metadataGenerator = (name: string) => ({
        ...metadata,
        base: {
            ...metadata.base,
            name: `${name}${testHash}`,
        },
    })

    let test1length
    let test2length
    let test3length

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        publisher = (await ocean.accounts.list())[0]
        publisher.setPassword(process.env.ACCOUNT_PASSWORD)

        // Data
        metadata = {
            base: {
                name: undefined,
                type: "dataset",
                description: "Weather information of UK including temperature and humidity",
                size: "3.1gb",
                dateCreated: "2012-02-01T10:55:11+00:00",
                author: "Met Office",
                license: "CC-BY",
                copyrightHolder: "Met Office",
                encoding: "UTF-8",
                compression: "zip",
                contentType: "text/csv",
                // tslint:disable-next-line
                workExample: "stationId,latitude,longitude,datetime,temperature,humidity423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
                files: [
                    {
                        url: "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
                        checksum: "085340abffh21495345af97c6b0e761",
                        contentLength: "12324",
                    },
                    {
                        url: "https://testocnfiles.blob.core.windows.net/testfiles/testzkp2.zip",
                    },
                ],
                links: [
                    {sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/"},
                    {sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/"},
                    {fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/"},
                ],
                inLanguage: "en",
                tags: "weather, uk, 2011, temperature, humidity",
                price: 10,
            },
        }

    })

    it("should be able to search the assets", async () => {
        const ddos: DDO[] = await ocean.assets.search(`Test1${testHash}`)

        assert.isArray(ddos, "A search should return an array")

        test1length = ddos.length
        test2length = (await ocean.assets.search(`Test2${testHash}`)).length
        test3length = (await ocean.assets.search(`Test3${testHash}`)).length
    })

    it("should regiester some a asset", async () => {
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test1") as any, publisher), DDO)
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test2") as any, publisher), DDO)
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test2") as any, publisher), DDO)
        assert.instanceOf(await ocean.assets.create(metadataGenerator("Test3") as any, publisher), DDO)
    })

    it("should search by text and see the increment of DDOs", async () => {
        assert.equal((await ocean.assets.search(`Test2${testHash}`)).length - test2length, 2, "Something was wrong searching the assets")
        assert.equal((await ocean.assets.search(`Test3${testHash}`)).length - test3length, 1, "Something was wrong searching the assets")
    })

    it("should return a list of DDOs", async () => {
        const ddos: DDO[] = await ocean.assets.search(`Test1${testHash}`)

        assert.equal(ddos.length - test1length, 1, "Something was wrong searching the assets")
        ddos.map(ddo => assert.instanceOf(ddo, DDO, "The DDO is not an instance of a DDO"))
    })

    it("should be able to do a query to get a list of DDOs", async () => {
        const ddos: DDO[] = await ocean.assets.query({
            text: `Test2${testHash}`,
            page: 0,
            offset: 1,
            query: {
                value: 1,
            },
            sort: {
                value: 1,
            },
        })

        assert.equal(ddos.length, 1, "Something was wrong searching the assets")
        ddos.map(ddo => assert.instanceOf(ddo, DDO, "The DDO is not an instance of a DDO"))
    })
})
