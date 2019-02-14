import SecretStoreProvider from "../secretstore/SecretStoreProvider"
import Account from "./Account"

/**
 * SecretStore submodule of Ocean Protocol.
 */
export default class OceanSecretStore {

    /**
     * Returns the instance of OceanSecretStore.
     * @return {Promise<OceanSecretStore>}
     */
    public static async getInstance(): Promise<OceanSecretStore> {
        if (!OceanSecretStore.instance) {
            OceanSecretStore.instance = new OceanSecretStore()
        }

        return OceanSecretStore.instance
    }

    /**
     * OceanSecretStore instance.
     * @type {OceanSecretStore}
     */
    private static instance: OceanSecretStore = null

    /**
     * Encrypt the given text and store the encryption keys using the `did`.
     * The encrypted text can be decrypted using the same keys identified by the `did`.
     * @param  {string}          did       Decentralized ID.
     * @param  {string}          content   Content to be encrypted.
     * @param  {string}          publisher Publisher account.
     * @return {Promise<string>}           Encrypted text.
     */
    public async encrypt(did: string, content: string, publisher: Account): Promise<string> {
        console.warn("TODO")
        return await this.getSecretStoreByAccount(publisher)
            // TODO did to id
            .encryptDocument(did, content)
    }

    /**
     * Decrypt an encrypted text using the stored encryption keys associated with the `did`.
     * Decryption requires that the account owner has access permissions for this `did`
     * @param  {string}          did      Decentralized ID.
     * @param  {string}          content  Content to be encrypted.
     * @param  {string}          consumer cONSUMER account.
     * @return {Promise<string>}          Encrypted text.
     */
    public async decrypt(did: string, content: string, consumer: Account): Promise<string> {
        console.warn("TODO")
        return await this.getSecretStoreByAccount(consumer)
            // TODO did to id
            .decryptDocument(did, content)
    }

    private getSecretStoreByAccount(account: Account) {
        const config: any = {address: account.getId()}
        if (account.getPassword()) {
            config.password = account.getPassword()
        }
        return SecretStoreProvider.getSecretStore(config)
    }
}
