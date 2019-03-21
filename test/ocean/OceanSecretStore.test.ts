import { assert, expect, spy, use } from "chai"
import * as spies from "chai-spies"

import Account from "../../src/ocean/Account"
import { Ocean } from "../../src/ocean/Ocean"
import { OceanSecretStore } from "../../src/ocean/OceanSecretStore"
import SecretStoreProvider from "../../src/secretstore/SecretStoreProvider"
import config from "../config"

use(spies)

describe("OceanSecretStore", () => {

    let oceanSecretStore: OceanSecretStore
    let accounts: Account[]

    const did = "a".repeat(64)

    before(async () => {
        const ocean = await Ocean.getInstance(config)
        oceanSecretStore = ocean.secretStore
        accounts = await ocean.accounts.list()
    })

    afterEach(() => {
        spy.restore()
    })

    describe("#encrypt()", () => {
        it("should encrypt a content", async () => {
            const secretStoreToSpy = SecretStoreProvider.getSecretStore({...config, address: accounts[0].getId()})
            const secretStoreEncryptSpy = spy.on(secretStoreToSpy, "encryptDocument", () => "encryptedResult")
            const secretStoreProviderGetInstanceSpy = spy.on(SecretStoreProvider, "getSecretStore", () => secretStoreToSpy)

            const result = await oceanSecretStore.encrypt(did, "test", accounts[0])

            expect(secretStoreProviderGetInstanceSpy).to.have.been.called.with({...config, address: accounts[0].getId()})
            expect(secretStoreEncryptSpy).to.have.been.called.with(did, "test")

            assert.equal(result, "encryptedResult", "Result doesn't match")
        })
    })

    describe("#decrypt()", () => {
        it("should decrypt a content", async () => {
            const secretStoreToSpy = SecretStoreProvider.getSecretStore({...config, address: accounts[0].getId()})
            const secretStoreEncryptSpy = spy.on(secretStoreToSpy, "decryptDocument", () => "decryptedResult")
            const secretStoreProviderGetInstanceSpy = spy.on(SecretStoreProvider, "getSecretStore", () => secretStoreToSpy)

            const result = await oceanSecretStore.decrypt(did, "encryptedContent", accounts[0])

            expect(secretStoreProviderGetInstanceSpy).to.have.been.called.with({...config, address: accounts[0].getId()})
            expect(secretStoreEncryptSpy).to.have.been.called.with(did, "encryptedContent")

            assert.equal(result, "decryptedResult", "Result doesn't match")
        })
    })
})
