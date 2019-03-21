import SecretStore from "@oceanprotocol/secret-store-client"
import SecretStoreConfig from "@oceanprotocol/secret-store-client/dist/models/SecretStoreConfig"

export default class SecretStoreProvider {

    public static getSecretStore(config: SecretStoreConfig): SecretStore {
        const {secretStoreUri, parityUri, password, address, threshold} = config
        config = {secretStoreUri, parityUri, password, address, threshold}
        // Cleaning undefined parameters
        Object.keys(config)
            .forEach((key) => config[key] || config[key] === 0 || delete config[key])

        const configRef = JSON.stringify(config)
        if (!SecretStoreProvider.secretStoreWithConfig.get(configRef)) {
            SecretStoreProvider.secretStoreWithConfig.set(configRef, new SecretStore({...config}))
        }

        return SecretStoreProvider.secretStoreWithConfig.get(configRef)
    }

    private static secretStoreWithConfig = new Map<string, SecretStore>()
}
