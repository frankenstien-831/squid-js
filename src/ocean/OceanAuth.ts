import Account from "./Account"
import { Instantiable, InstantiableConfig } from "../Instantiable.abstract"

// TODO: be able to read it from config
const defaultAuthMessage = "Ocean Protocol Authentication"

const localStorageKey = "SquidTokens"

/**
 * Tokens submodule of Ocean Protocol.
 */
export class OceanAuth extends Instantiable {

    /**
     * Returns the instance of OceanAuth.
     * @return {Promise<OceanAuth>}
     */
    public static async getInstance(config: InstantiableConfig): Promise<OceanAuth> {
        const instance = new OceanAuth()
        instance.setInstanceConfig(config)

        return instance
    }

    /**
     * Returns a token for a account.
     * @param  {Account} account Signer account.
     * @return {Promise<string>} Token
     */
    public async get(account: Account): Promise<string> {
        const time = Date.now()
        const message = `${defaultAuthMessage}\n${time}`

        try {
            const signature = await this.ocean.utils.signature
                .signText(
                    message,
                    account.getId(),
                    account.getPassword(),
                )

            return `${signature}-${time}`
        } catch {
            throw new Error("User denied the signature.")
        }
    }

    /**
     * Returns the address of signed token.
     * @param  {string}          token Token.
     * @return {Promise<string>}       Signer address.
     */
    public async check(token: string): Promise<string> {
        const expiration = 30 * 24 * 60 * 60 * 1000 // 30 days
        const [signature, timestamp] = token.split('-')

        const message = `${defaultAuthMessage}\n${timestamp}`

        if ((+timestamp + expiration) < Date.now()) {
            return `0x${"0".repeat(40)}`
        }

        return this.web3.utils.toChecksumAddress(
            await this.ocean.utils.signature.verifyText(message, signature)
        )
    }

    /**
     * Generates and stores the token for a account.
     * @param {Account} account Signer account.
     */
    public async store(account: Account) {
        const token = await this.get(account)
        this.writeToken(account.getId(), token)
    }

    /**
     * Returns a stored token.
     * @param {Account} account Signer account.
     */
    public async restore(account: Account): Promise<string> {
        const token = this.readToken(account.getId())
        if (!token) {
            return
        }
        const signer = await this.check(token)
        if (signer.toLowerCase() !== account.getId().toLowerCase()) {
            return
        }
        return token
    }

    /**
     * Returns if the token is stored and is valid.
     * @param  {Account}          account Signer account.
     * @return {Promise<boolean>}         Is stored and valid.
     */
    public async isStored(account: Account): Promise<boolean> {
        return !!this.restore(account)
    }

    private writeToken(address: string, token: string) {
        const storedTokens = localStorage.getItem(localStorageKey)
        const tokens = storedTokens ? JSON.parse(storedTokens) : {}

        localStorage.setItem(localStorageKey, JSON.stringify({
            ...tokens,
            [address]: token,
        }))
    }

    private readToken(address: string) {
        const storedTokens = localStorage.getItem(localStorageKey)
        const tokens = storedTokens ? JSON.parse(storedTokens) : {}

        return tokens[address]
    }
}
