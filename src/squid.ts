import Config from "./models/Config"
import Account from "./ocean/Account"
import DID from "./ocean/DID"
import { Ocean } from "./ocean/Ocean"
import { LoggerInstance as Logger} from "./utils/Logger"
import WebServiceConnectorProvider from "./utils/WebServiceConnectorProvider"
import Keeper from "./keeper/Keeper"

import * as templates from "./keeper/contracts/templates"
import * as conditions from "./keeper/contracts/conditions"
import * as utils from "./utils"

// Exports
export * from "./ddo/DDO"
export * from "./ddo/MetaData"

export { AgreementTemplate } from "./keeper/contracts/templates"
export { Condition, ConditionState } from "./keeper/contracts/conditions"

export {
    Ocean,

    Account,
    Config,
    DID,
    Logger,
    Keeper,
    WebServiceConnectorProvider,

    conditions,
    templates,
    utils,
}
