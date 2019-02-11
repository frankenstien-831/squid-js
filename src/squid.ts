import Access from "./ocean/ServiceAgreements/Templates/Access"
import Account from "./ocean/Account"
import Config from "./models/Config"
import DID from "./ocean/DID"
import FitchainCompute from "./ocean/ServiceAgreements/Templates/FitchainCompute"
import IdGenerator from "./ocean/IdGenerator"
import Logger from "./utils/Logger"
import Ocean from "./ocean/Ocean"
import SecretStoreProvider from "./secretstore/SecretStoreProvider"
import ServiceAgreement from "./ocean/ServiceAgreements/ServiceAgreement"
import ServiceAgreementTemplate from "./ocean/ServiceAgreements/ServiceAgreementTemplate"
import WebServiceConnectorProvider from "./utils/WebServiceConnectorProvider"

import EventListener from "./keeper/EventListener"

// Exports
export * from "./ddo/DDO"
export * from "./ddo/MetaData"

const Templates = {Access, FitchainCompute}

export {
    Ocean,

    Account,
    Config,
    DID,
    EventListener,
    IdGenerator,
    Logger,
    SecretStoreProvider,
    ServiceAgreement,
    ServiceAgreementTemplate,
    Templates,
    WebServiceConnectorProvider,
}
