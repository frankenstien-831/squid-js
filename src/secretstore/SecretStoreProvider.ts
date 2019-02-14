import SecretStore from "@oceanprotocol/secret-store-client"
import SecretStoreConfig from "@oceanprotocol/secret-store-client/dist/models/SecretStoreConfig"
import ConfigProvider from "../ConfigProvider"
import Config from "../models/Config"

export default class SecretStoreProvider {

    public static setSecretStore(secretStore: SecretStore) {

        SecretStoreProvider.secretStore = secretStore
    }

    public static getSecretStore(config?: Partial<SecretStoreConfig>): SecretStore {
        config = {...config}
        // Cleaning undefined parameters
        Object.keys(config)
            .forEach(key => config[key] || delete config[key])

        if (!Object.keys(config).length) {
            if (!SecretStoreProvider.secretStore) {
                SecretStoreProvider.secretStore = new SecretStore(ConfigProvider.getConfig())
            }

            return SecretStoreProvider.secretStore
        } else {
            const configRef = JSON.stringify(config)
            if (!SecretStoreProvider.secretStoreByUrl.get(configRef)) {
                SecretStoreProvider.secretStoreByUrl.set(configRef,
                    new SecretStore({
                        ...ConfigProvider.getConfig(),
                        ...config,
                    }),
                )
            }

            return SecretStoreProvider.secretStoreByUrl.get(configRef)
        }
    }

    private static secretStore: SecretStore
    private static secretStoreByUrl = new Map<string, SecretStore>()
}
