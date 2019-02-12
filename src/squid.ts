import Config from "./models/Config"
import Account from "./ocean/Account"
import DID from "./ocean/DID"
import IdGenerator from "./ocean/IdGenerator"
import Ocean from "./ocean/Ocean"
import ServiceAgreement from "./ocean/ServiceAgreements/ServiceAgreement"
import ServiceAgreementTemplate from "./ocean/ServiceAgreements/ServiceAgreementTemplate"
import Access from "./ocean/ServiceAgreements/Templates/Access"
import FitchainCompute from "./ocean/ServiceAgreements/Templates/FitchainCompute"
import SecretStoreProvider from "./secretstore/SecretStoreProvider"
import Logger from "./utils/Logger"
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
