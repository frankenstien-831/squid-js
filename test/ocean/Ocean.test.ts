import { assert, spy, use } from "chai"
import * as spies from "chai-spies"

import AquariusProvider from "../../src/aquarius/AquariusProvider"
import SearchQuery from "../../src/aquarius/query/SearchQuery"
import BrizoProvider from "../../src/brizo/BrizoProvider"
import ConfigProvider from "../../src/ConfigProvider"
import { DDO } from "../../src/ddo/DDO"
import { Service } from "../../src/ddo/Service"
import Account from "../../src/ocean/Account"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreement from "../../src/ocean/ServiceAgreements/ServiceAgreement"
import SecretStoreProvider from "../../src/secretstore/SecretStoreProvider"
import * as signatureHelpers from "../../src/utils/SignatureHelpers"
import WebServiceConnectorProvider from "../../src/utils/WebServiceConnectorProvider"
import config from "../config"
import TestContractHandler from "../keeper/TestContractHandler"
import AquariusMock from "../mocks/Aquarius.mock"
import BrizoMock from "../mocks/Brizo.mock"
import SecretStoreMock from "../mocks/SecretStore.mock"
import WebServiceConnectorMock from "../mocks/WebServiceConnector.mock"
import { metadataMock } from "../testdata/MetaData"

use(spies)

let ocean: Ocean
let accounts: Account[]
let testPublisher: Account

describe("Ocean", () => {

    const metadata = metadataMock

    before(async () => {
        ConfigProvider.setConfig(config)
    })

    beforeEach(async () => {
        spy.on(signatureHelpers, "signText", () => `0x${"a".repeat(130)}`)
    })
    afterEach(() => {
        spy.restore()
    })

    before(async () => {
        ConfigProvider.setConfig(config)
        AquariusProvider.setAquarius(new AquariusMock(config))
        BrizoProvider.setBrizo(new BrizoMock(config))
        SecretStoreProvider.setSecretStore(new SecretStoreMock(config))
        await TestContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()

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

            const accs: Account[] = await ocean.getAccounts()

            assert(10 === accs.length)
            assert(0 === (await accs[5].getBalance()).ocn)
            assert("string" === typeof accs[0].getId())
        })
    })

    // TODO: ensure if it should fail or not
    describe("#resolveDID()", () => {
        it("should resolve a did to a ddo", async () => {
            const ddo: DDO = await ocean.registerAsset(metadata, testPublisher)

            const resolvedDDO: DDO = await ocean.resolveDID(ddo.id)

            assert(resolvedDDO)
            assert(resolvedDDO.id === ddo.id)
        })
    })

    // TODO: ensure if it should fail or not
    describe("#registerAsset()", () => {
        it("should register an asset", async () => {
            const ddo: DDO = await ocean.registerAsset(metadata, testPublisher)

            assert(ddo)
            assert(ddo.id.startsWith("did:op:"))
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

            const assets: any[] = await ocean.searchAssets(query)

            assert(assets)
        })
    })

    describe("#searchAssetsByText()", () => {
        it("should search for assets", async () => {
            const text = "office"
            const assets: any[] = await ocean.searchAssetsByText(text)

            assert(assets)
        })
    })

    describe("#signServiceAgreement()", () => {
        it("should sign an service agreement", async () => {
            const publisher = accounts[0]
            const consumer = accounts[1]

            const ddo: DDO = await ocean.registerAsset(metadata, publisher)

            const service: Service = ddo.findServiceByType("Access")

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))

            await consumer.requestTokens(metadata.base.price)

            const signServiceAgreementResult: any = await ocean.signServiceAgreement(ddo.id,
                service.serviceDefinitionId, consumer)

            assert(signServiceAgreementResult)
            assert(signServiceAgreementResult.serviceAgreementId, "no serviceAgreementId")
            assert(signServiceAgreementResult.serviceAgreementSignature, "no serviceAgreementSignature")
            assert(signServiceAgreementResult.serviceAgreementSignature.startsWith("0x"))
            assert(signServiceAgreementResult.serviceAgreementSignature.length === 132)
        })
    })

    describe("#executeServiceAgreement()", () => {
        it("should execute a service agreement", async () => {
            const publisher = accounts[0]
            const consumer = accounts[1]

            const ddo: DDO = await ocean.registerAsset(metadata, publisher)
            const service: Service = ddo.findServiceByType("Access")

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))

            const signServiceAgreementResult: any = await ocean.signServiceAgreement(ddo.id,
                service.serviceDefinitionId, consumer)

            const serviceAgreement: ServiceAgreement = await ocean.executeServiceAgreement(ddo.id,
                service.serviceDefinitionId, signServiceAgreementResult.serviceAgreementId,
                signServiceAgreementResult.serviceAgreementSignature, consumer, publisher)

            assert(serviceAgreement)
        })
    })
})
