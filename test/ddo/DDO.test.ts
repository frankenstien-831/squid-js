import { assert, expect, spy, use } from "chai"
import * as spies from "chai-spies"
import * as Web3 from "web3"

import { DDO } from "../../src/ddo/DDO"
import { Service } from "../../src/ddo/Service"
import * as signatureHelpers from "../../src/utils/SignatureHelpers"
import { Ocean } from "../../src/ocean/Ocean"
import config from "../config"
import TestContractHandler from "../keeper/TestContractHandler"

import * as jsonDDO from "../testdata/ddo.json"

use(spies)

describe("DDO", () => {

    const testDDO: DDO = new DDO({
        id: `did:op:${"a".repeat(64)}`,
        publicKey: [
            {
                id: "did:op:123456789abcdefghi#keys-1",
                type: "RsaVerificationKey2018",
                owner: "did:op:123456789abcdefghi",
                publicKeyPem: "-----BEGIN PUBLIC KEY...END PUBLIC KEY-----\r\n",
            },
            {
                id: "did:op:123456789abcdefghi#keys-2",
                type: "Ed25519VerificationKey2018",
                owner: "did:op:123456789abcdefghi",
                publicKeyBase58: "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV",
            },
        ],
        authentication: [
            {
                type: "RsaSignatureAuthentication2018",
                publicKey: "did:op:123456789abcdefghi#keys-1",
            },
            {
                type: "ieee2410Authentication2018",
                publicKey: "did:op:123456789abcdefghi#keys-2",
            },
        ],
        service: [
            {
                type: "OpenIdConnectVersion1.0Service",
                serviceEndpoint: "https://openid.example.com/",
            },
            {
                type: "CredentialRepositoryService",
                serviceEndpoint: "https://repository.example.com/service/8377464",
            },
            {
                type: "XdiService",
                serviceEndpoint: "https://xdi.example.com/8377464",
            },
            {
                type: "HubService",
                serviceEndpoint: "https://hub.example.com/.identity/did:op:0123456789abcdef/",
            },
            {
                type: "MessagingService",
                serviceEndpoint: "https://example.com/messages/8377464",
            },
            {
                type: "SocialWebInboxService",
                serviceEndpoint: "https://social.example.com/83hfh37dj",
                description: "My public social inbox",
                spamCost: {
                    amount: "0.50",
                    currency: "USD",
                },
            } as any,
            {
                id: "did:op:123456789abcdefghi;bops",
                type: "BopsService",
                serviceEndpoint: "https://bops.example.com/enterprise/",
            },
            {
                type: "Consume",
                // tslint:disable-next-line
                serviceEndpoint: "http://mybrizo.org/api/v1/brizo/services/consume?pubKey=${pubKey}&serviceId={serviceId}&url={url}",
            },
            {
                type: "Compute",
                // tslint:disable-next-line
                serviceEndpoint: "http://mybrizo.org/api/v1/brizo/services/compute?pubKey=${pubKey}&serviceId={serviceId}&algo={algo}&container={container}",
            },
            {
                type: "Metadata",
                serviceEndpoint: "http://myaquarius.org/api/v1/provider/assets/metadata/{did}",
                metadata: {
                    base: {
                        name: "UK Weather information 2011",
                        type: "dataset",
                        description: "Weather information of UK including temperature and humidity",
                        size: "3.1gb",
                        dateCreated: "2012-10-10T17:00:000Z",
                        author: "Met Office",
                        license: "CC-BY",
                        copyrightHolder: "Met Office",
                        encoding: "UTF-8",
                        compression: "zip",
                        contentType: "text/csv",
                        workExample: "423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
                        contentUrls: [
                            "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
                            "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
                        ],
                        links: [
                            {
                                // tslint:disable-next-line
                                sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/"
                            },
                            {
                                // tslint:disable-next-line
                                sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/"
                            },
                            {
                                fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/",
                            },
                        ],
                        inLanguage: "en",
                        tags: "weather, uk, 2011, temperature, humidity",
                        price: 10,
                        files: [
                            {
                                url: "234ab87234acbd09543085340abffh21983ddhiiee982143827423421",
                                checksum: "efb2c764274b745f5fc37f97c6b0e761",
                                contentLength: "4535431",
                                resourceId: "access-log2018-02-13-15-17-29-18386C502CAEA932",
                            },
                            {
                                url: "234ab87234acbd6894237582309543085340abffh21983ddhiiee982143827423421",
                                checksum: "085340abffh21495345af97c6b0e761",
                                contentLength: "12324",
                            },
                            {
                                url: "80684089027358963495379879a543085340abffh21983ddhiiee982143827abcc2",
                            },
                        ],
                        checksum: "",
                    },
                    curation: {
                        rating: 0.93,
                        numVotes: 123,
                        schema: "Binary Votting",
                    },
                    additionalInformation: {
                        updateFrecuency: "yearly",
                        structuredMarkup: [
                            {
                                uri: "http://skos.um.es/unescothes/C01194/jsonld",
                                mediaType: "application/ld+json",
                            },
                            {
                                uri: "http://skos.um.es/unescothes/C01194/turtle",
                                mediaType: "text/turtle",
                            },
                        ],
                    },
                },
            },
        ],
    })

    let web3: Web3

    beforeEach(async () => {
        await TestContractHandler.prepareContracts()
        web3 = (await Ocean.getInstance(config) as any).web3
    })

    afterEach(() => {
        spy.restore()
    })

    describe("#serialize()", () => {

        it("should properly serialize", async () => {

            const ddoString = DDO.serialize(testDDO)
            assert(ddoString)
            assert(ddoString.startsWith("{"))
        })
    })

    describe("#constructor()", () => {

        it("should create an empty ddo", async () => {

            const ddo = new DDO()
            assert(ddo)

            assert(ddo.service.length === 0)
            assert(ddo.authentication.length === 0)
            assert(ddo.publicKey.length === 0)
        })

        it("should create an predefined ddo", async () => {

            const service: Partial<Service> & any = {
                serviceEndpoint: "http://",
                description: "nice service",
            }

            const ddo = new DDO({
                service: [service as any],
            })
            assert(ddo)

            assert(ddo.service.length === 1)
            assert((ddo.service[0] as any).description === service.description)

            assert(ddo.authentication.length === 0)
            assert(ddo.publicKey.length === 0)
        })
    })

    describe("#deserialize()", () => {

        it("should properly deserialize from serialized object", async () => {

            const ddoString = DDO.serialize(testDDO)
            assert.typeOf(ddoString, "string")

            const ddo: DDO = DDO.deserialize(ddoString)
            assert.instanceOf(ddo, DDO)

            assert.equal(ddo.id, testDDO.id)
            assert.equal(ddo.publicKey[0].publicKeyPem, testDDO.publicKey[0].publicKeyPem)
        })

        it("should properly deserialize from json file", async () => {

            const ddo: DDO = DDO.deserialize(JSON.stringify(jsonDDO))
            assert(ddo)

            assert.equal(ddo.id, jsonDDO.id)
            assert.equal(ddo.publicKey[0].publicKeyPem, jsonDDO.publicKey[0].publicKeyPem)
        })
    })

    describe("#getChecksum()", () => {
        it("should properly generate a the checksum DDO", async () => {
            const ddo = new DDO(testDDO)
            const checksum = ddo.getChecksum()

            assert.equal(checksum, "15f27a7a3c7b15d2b06dec7347c6b8da")
        })
    })

    describe("#generateProof()", () => {

        const publicKey = `0x${"a".repeat(40)}`
        const signature = `0x${"a".repeat(130)}`

        it("should properly generate the proof", async () => {
            const signTextSpy = spy.on(signatureHelpers, "signText", () => signature)
            const ddo = new DDO(testDDO)
            const checksum = ddo.getChecksum()
            const proof = await ddo.generateProof(web3, publicKey)

            assert.include(proof as any, {
                creator: publicKey,
                type: "DDOIntegritySignature",
                signatureValue: signature,
            })
            expect(signTextSpy).to.have.been.called.with(checksum, publicKey)
        })
    })

    describe("#addProof()", () => {

        const publicKey = `0x${"a".repeat(40)}`

        it("should properly add the proof on the DDO", async () => {
            const fakeProof = {
                creation: Date.now(),
                creator: "test",
                type: "test",
                signaturValue: "test",
            } as any
            const ddo = new DDO(testDDO)
            const generateProofSpy = spy.on(ddo, "generateProof", () => fakeProof)
            await ddo.addProof(web3, publicKey)

            assert.equal(ddo.proof, fakeProof)
            expect(generateProofSpy).to.have.been.called.with(publicKey)
        })
    })
})
