import {Account, Logger, Ocean, ServiceAgreementTemplate, Templates} from "../squid"
import config from "./config"
import {runner} from "./runner"

async function exec() {
    const ocean: Ocean = await Ocean.getInstance(config)

    const templateOwner: Account = (await ocean.getAccounts())[0]

    const serviceAgreementTemplate: ServiceAgreementTemplate = new ServiceAgreementTemplate(new Templates.Access())
    const serviceAgreementRegistered: boolean = await serviceAgreementTemplate.register(templateOwner.getId())

    Logger.log("ServiceAgreementTemplate registered:", serviceAgreementRegistered,
        "templateId:", serviceAgreementTemplate.getId())
}

runner(exec)
