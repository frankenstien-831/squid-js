import SecretStore from "@oceanprotocol/secret-store-client"
import ConfigProvider from "../ConfigProvider"

export default class SecretStoreProvider {

    public static setSecretStore(secretStore: SecretStore) {

        SecretStoreProvider.secretStore = secretStore
    }

    public static getSecretStore(url?: string): SecretStore {
        if (!url) {
            if (!SecretStoreProvider.secretStore) {
                SecretStoreProvider.secretStore = new SecretStore(ConfigProvider.getConfig())
            }

            return SecretStoreProvider.secretStore
        } else {
            if (!SecretStoreProvider.secretStoreByUrl.get(url)) {
                SecretStoreProvider.secretStoreByUrl.set(url,
                    new SecretStore({
                        ...ConfigProvider.getConfig(),
                        secretStoreUri: url,
                    }),
                )
            }

            return SecretStoreProvider.secretStoreByUrl.get(url)
        }
    }

    private static secretStore: SecretStore
    private static secretStoreByUrl = new Map<string, SecretStore>()
}
