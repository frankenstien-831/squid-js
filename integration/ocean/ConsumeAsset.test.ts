import { assert } from "chai"
import * as Web3 from "web3"
import * as fs from "fs";

import { config } from "../config"

import { Ocean, MetaData, Account, DDO } from "../../src" // @oceanprotocol/squid

describe("Consume Asset", () => {
    let ocean: Ocean

    let publisher: Account
    let consumer: Account

    let ddo: DDO
    let agreementId: string

    const testHash = Math.random().toString(36).substr(2)
    let metadata: Partial<MetaData>
    let metadataGenerator = (name: string) => ({
        ...metadata,
        base: {
            ...metadata.base,
            name: `${name}${testHash}`,
        },
    })

    before(async () => {
        ocean = await Ocean.getInstance({
            ...config,
            web3Provider: new Web3.providers.HttpProvider("http://localhost:8545", 0, "0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e", "node0"),
        })

        // Accounts
        publisher = new Account("0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e")
        publisher.setPassword("node0")
        consumer = new Account("0x068Ed00cF0441e4829D9784fCBe7b9e26D4BD8d0")
        consumer.setPassword("secret")

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
                        url: "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.pdf",
                        checksum: "085340abffh21495345af97c6b0e761",
                        contentLength: "12324",
                    },
                    {
                        url: "https://raw.githubusercontent.com/oceanprotocol/squid-js/develop/README.md",
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

    it("should regiester an asset", async () => {
        ddo = await ocean.assets.create(metadataGenerator("ToBeConsumed") as any, publisher);

        assert.instanceOf(ddo, DDO)
    })

    it("should order the asset", async () => {
        const accessService = ddo.findServiceByType("Access")

        agreementId = await ocean.assets.order(ddo.id, accessService.serviceDefinitionId, consumer)
        assert.isDefined(agreementId)
    })

    it("should consume and store the assets", async () => {
        const accessService = ddo.findServiceByType("Access")

        const folder = "/tmp/ocean/squid-js"
        const path = await ocean.assets.consume(agreementId, ddo.id, accessService.serviceDefinitionId, consumer, folder)

        assert.include(path, folder, "The storage path is not correct.")

        const files = await new Promise(resolve => {
            fs.readdir(path, (err, files) => {
                resolve(files)
            });
        })

        assert.deepEqual(files, ["README.md", "testzkp.pdf"], "Stored files are not correct.")
    })
})
