import { assert, expect, spy, use } from "chai"
import * as spies from "chai-spies"

import ConfigProvider from "../../src/ConfigProvider"
import Web3Provider from "../../src/keeper/Web3Provider"
import { signText, verifyText } from "../../src/utils/SignatureHelpers"
import config from "../config"

use(spies)

describe("SignatureHelpers", () => {

    const publicKey = `0x${"a".repeat(40)}`
    const text = "0123456789abcde"
    const signature = `0x${"a".repeat(130)}`

    before(async () => {
        ConfigProvider.setConfig(config)
    })
    afterEach(() => {
        spy.restore()
    })

    describe("#signText", () => {
        let personalSignSpy

        beforeEach(() => {
            const web3 = Web3Provider.getWeb3()
            personalSignSpy = spy.on(web3.eth.personal, "sign", () => signature)
        })

        it("should sign a text as expected", async () => {
            const signed = await signText(text, publicKey)

            assert.equal(signed, signature)
            expect(personalSignSpy).to.have.been.called.with(text, publicKey)
        })

        it("should sign a text as expected using password", async () => {
            const signed = await signText(text, publicKey, "test")

            assert.equal(signed, signature)
            expect(personalSignSpy).to.have.been.called.with(text, publicKey, "test")
        })
    })

    describe("#verifyText", () => {
        it("should recover the privateKey of a signed message", async () => {
            const web3 = Web3Provider.getWeb3()
            const personalRecoverSpy = spy.on(web3.eth.personal, "ecRecover", () => publicKey)

            const verifiedPublicKey = await verifyText(text, signature)

            assert.equal(publicKey, verifiedPublicKey)
            expect(personalRecoverSpy).to.have.been.called.with(text, signature)
        })
    })
})
