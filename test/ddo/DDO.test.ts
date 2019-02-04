import {assert} from "chai"
import { Authentication} from "../../src/ddo/Authentication"
import { DDO } from "../../src/ddo/DDO"
import { MetaData, MetaDataBase, Curation, AdditionalInformation } from "../../src/ddo/MetaData"
import { PublicKey } from "../../src/ddo/PublicKey"
import { Service } from "../../src/ddo/Service"
import * as jsonDDO from "../testdata/ddo.json"

describe("DDO", () => {

    const testDDO: DDO = new DDO({
        publicKey: [
            {
                id: "did:op:123456789abcdefghi#keys-1",
                type: "RsaVerificationKey2018",
                owner: "did:op:123456789abcdefghi",
                publicKeyPem: "-----BEGIN PUBLIC KEY...END PUBLIC KEY-----\r\n",
            } as PublicKey,
            {
                id: "did:op:123456789abcdefghi#keys-2",
                type: "Ed25519VerificationKey2018",
                owner: "did:op:123456789abcdefghi",
                publicKeyBase58: "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV",
            } as PublicKey,
        ],
        authentication: [
            {
                type: "RsaSignatureAuthentication2018",
                publicKey: "did:op:123456789abcdefghi#keys-1",
            } as Authentication,
            {
                type: "ieee2410Authentication2018",
                publicKey: "did:op:123456789abcdefghi#keys-2",
            } as Authentication,
        ],
        service: [
            {
                type: "OpenIdConnectVersion1.0Service",
                serviceEndpoint: "https://openid.example.com/",
            } as Service,
            {
                type: "CredentialRepositoryService",
                serviceEndpoint: "https://repository.example.com/service/8377464",
            } as Service,
            {
                type: "XdiService",
                serviceEndpoint: "https://xdi.example.com/8377464",
            } as Service,
            {
                type: "HubService",
                serviceEndpoint: "https://hub.example.com/.identity/did:op:0123456789abcdef/",
            } as Service,
            {
                type: "MessagingService",
                serviceEndpoint: "https://example.com/messages/8377464",
            } as Service,
            {
                type: "SocialWebInboxService",
                serviceEndpoint: "https://social.example.com/83hfh37dj",
                description: "My public social inbox",
                spamCost: {
                    amount: "0.50",
                    currency: "USD",
                },
            } as Service,
            {
                id: "did:op:123456789abcdefghi;bops",
                type: "BopsService",
                serviceEndpoint: "https://bops.example.com/enterprise/",
            } as Service,
            {
                type: "Consume",
                // tslint:disable-next-line
                serviceEndpoint: "http://mybrizo.org/api/v1/brizo/services/consume?pubKey=${pubKey}&serviceId={serviceId}&url={url}",
            } as Service,
            {
                type: "Compute",
                // tslint:disable-next-line
                serviceEndpoint: "http://mybrizo.org/api/v1/brizo/services/compute?pubKey=${pubKey}&serviceId={serviceId}&algo={algo}&container={container}",
            } as Service,
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
                    } as MetaDataBase,
                    curation: {
                        rating: 0.93,
                        numVotes: 123,
                        schema: "Binary Votting",
                    } as Curation,
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
                    } as AdditionalInformation,
                } as MetaData,
            },
        ],
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

            const service: Service = {
                serviceEndpoint: "http://",
                description: "nice service",
            } as Service

            const ddo = new DDO({
                service: [service],
            })
            assert(ddo)

            assert(ddo.service.length === 1)
            assert(ddo.service[0].description === service.description)

            assert(ddo.authentication.length === 0)
            assert(ddo.publicKey.length === 0)
        })
    })

    describe("#deserialize()", () => {

        it("should properly deserialize from serialized object", async () => {

            const ddoString = DDO.serialize(testDDO)
            assert(ddoString)

            const ddo: DDO = DDO.deserialize(ddoString)
            assert(ddo)

            assert(ddo.id === testDDO.id)
            assert(ddo.publicKey[0].publicKeyPem === testDDO.publicKey[0].publicKeyPem)
        })

        it("should properly deserialize from json file", async () => {

            const ddo: DDO = DDO.deserialize(JSON.stringify(jsonDDO))
            assert(ddo)

            assert(ddo.id === jsonDDO.id)
            assert(ddo.publicKey[0].publicKeyPem === jsonDDO.publicKey[0].publicKeyPem)
        })
    })
})
