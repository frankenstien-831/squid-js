import { assert } from 'chai'

import { config } from "../config"

import { Ocean, MetaData, DDO, DID, Account, ServiceAgreement } from '../../src' // @oceanprotocol/squid

describe("Buy Asset", () => {
    let ocean: Ocean

    let publisher: Account
    let consumer: Account

    let metadata: Partial<MetaData>

    let ddo: DDO
    let did: DID
    let serviceAgreementSignatureResult: {serviceAgreementId: string, serviceAgreementSignature: string}
    let serviceAgreement: ServiceAgreement

    before(async () => {
        ocean = await Ocean.getInstance(config)

        // Accounts
        publisher = (await ocean.getAccounts())[0]
        publisher.setPassword(process.env.ACCOUNT_PASSWORD)
        consumer = (await ocean.getAccounts())[1]

        // Data
        metadata = {
            base: {
                name: "Office Humidity",
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

    it("should regiester a asset", async () => {
        ddo = await ocean.registerAsset(metadata as any, publisher)
        did = DID.parse(ddo.id)

        assert.isDefined(ddo, "Register has not returned a DDO")
        assert.match(ddo.id, /^did:op:[a-f0-9]{64}$/, "DDO id is not valid")
        assert.isAtLeast(ddo.authentication.length, 1, "Default authentication not added")
        assert.isDefined(ddo.findServiceByType("Access"), "DDO Access service doesn't exist")
    })

    it("should be able to request tokens for consumer", async () => {
        const initialBalance = (await consumer.getBalance()).ocn;
        await consumer.requestTokens(metadata.base.price)

        assert.equal((await consumer.getBalance()).ocn, initialBalance + metadata.base.price, "OCN Tokens not delivered")
    })

    it("should sign the service agreement", async () => {
        const accessService = ddo.findServiceByType("Access")

        serviceAgreementSignatureResult = await ocean.signServiceAgreement(ddo.id, accessService.serviceDefinitionId, consumer)

        const {serviceAgreementId, serviceAgreementSignature} = serviceAgreementSignatureResult
        assert.match(serviceAgreementId, /^[a-f0-9]{64}$/, "Service agreement ID seems not valid")
        assert.match(serviceAgreementSignature, /^0x[a-f0-9]{130}$/, "Service agreement signature seems not valid")
    })

    it("should execute the service agreement", async () => {
        const accessService = ddo.findServiceByType("Access")

        serviceAgreement = await ocean.executeServiceAgreement(
            ddo.id,
            accessService.serviceDefinitionId,
            serviceAgreementSignatureResult.serviceAgreementId,
            serviceAgreementSignatureResult.serviceAgreementSignature,
            consumer,
            publisher,
        )

        assert.match(serviceAgreement.getId(), /^0x[a-f0-9]{64}$/, "Service agreement ID seems not valid")
    })

    it("should pay asset trough the service agreement", async () => {
        const paid = await serviceAgreement.payAsset(did.getId(), metadata.base.price, consumer)
        assert.isTrue(paid, "The asset has not been paid correctly")
    })
})
