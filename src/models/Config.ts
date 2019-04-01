import { LogLevel } from "../utils/Logger"
export { LogLevel } from "../utils/Logger"

export class Config {
    /* Aquarius Config */
    // the url to the aquarius
    public aquariusUri: string

    /* Brizo Config */
    // the url to the brizo
    public brizoUri: string
    // the address of brizo
    public brizoAddress?: string

    /* Keeper Config */
    // the uri to the node we want to connect to, not need if web3Provider is set
    public nodeUri?: string
    // from outside eg. metamask
    public web3Provider?: any

    // the uri of the secret store to connect to
    public secretStoreUri: string

    /* Squid config */
    public verbose: boolean | LogLevel
}

export default Config
