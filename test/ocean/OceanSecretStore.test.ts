import { assert, expect, spy, use } from "chai"
import * as spies from "chai-spies"

import ConfigProvider from "../../src/ConfigProvider"
import Account from "../../src/ocean/Account"
import Ocean from "../../src/ocean/Ocean"
import OceanSecretStore from "../../src/ocean/OceanSecretStore"
import SecretStoreProvider from "../../src/secretstore/SecretStoreProvider"
import config from "../config"

use(spies)

describe("OceanSecretStore", () => {

    let oceanSecretStore: OceanSecretStore
    let accounts: Account[]

    const did = `did:op:${"a".repeat(64)}`

    before(async () => {
        oceanSecretStore = await OceanSecretStore.getInstance()
        ConfigProvider.setConfig(config)

        const ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()
    })

    afterEach(() => {
        spy.restore()
    })

    describe("#getInstance()", () => {
        it("should get an instance of OceanSecretStore", async () => {
            const oceanSecretStore: OceanSecretStore = await OceanSecretStore.getInstance()

            assert.instanceOf(oceanSecretStore, OceanSecretStore, "No returned OceanSecretStore instance")
        })
    })

    describe("#encrypt()", () => {
        it("should encrypt a content", async () => {
            const secretStoreToSpy = SecretStoreProvider.getSecretStore()
            const secretStoreEncryptSpy = spy.on(secretStoreToSpy, "encryptDocument", () => "encryptedResult")
            const secretStoreProviderGetInstanceSpy = spy.on(SecretStoreProvider, "getSecretStore", () => secretStoreToSpy)

            const result = await oceanSecretStore.encrypt(did, "test", accounts[0])

            expect(secretStoreProviderGetInstanceSpy).to.have.been.called.with({address: accounts[0].getId()})
            expect(secretStoreEncryptSpy).to.have.been.called.with(did, "test")

            assert.equal(result, "encryptedResult", "Result doesn't match")
        })
    })

    describe("#decrypt()", () => {
        it("should decrypt a content", async () => {
            const secretStoreToSpy = SecretStoreProvider.getSecretStore()
            const secretStoreEncryptSpy = spy.on(secretStoreToSpy, "decryptDocument", () => "decryptedResult")
            const secretStoreProviderGetInstanceSpy = spy.on(SecretStoreProvider, "getSecretStore", () => secretStoreToSpy)

            const result = await oceanSecretStore.decrypt(did, "encryptedContent", accounts[0])

            expect(secretStoreProviderGetInstanceSpy).to.have.been.called.with({address: accounts[0].getId()})
            expect(secretStoreEncryptSpy).to.have.been.called.with(did, "encryptedContent")

            assert.equal(result, "decryptedResult", "Result doesn't match")
        })
    })
})
