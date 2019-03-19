import Config from "./models/Config"
import LoggerInstance, { LogLevel } from "./utils/Logger"

/**
 * Stores the configuration of the library.
 */
export default class ConfigProvider {

    /**
     * @return {Config} Library config.
     */
    public static getConfig(): Config {
        return ConfigProvider.config
    }

    /**
     * @param {Config} Library config.
     */
    public static setConfig(config: Config) {
        LoggerInstance.setLevel(
            typeof config.verbose !== "number"
                ? (config.verbose ? LogLevel.Log : LogLevel.None)
                : config.verbose as LogLevel,
        )

        ConfigProvider.config = config
    }

    /**
     * Library config.
     * @type {Config}
     */
    private static config: Config
}
