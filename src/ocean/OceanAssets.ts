import { SearchQuery } from "../aquarius/query/SearchQuery"
import { DDO } from "../ddo/DDO"
import { MetaData } from "../ddo/MetaData"
import { Service, ServiceAuthorization } from "../ddo/Service"
import Account from "./Account"
import DID from "./DID"
import { fillConditionsWithDDO } from "../utils"
import { Instantiable, InstantiableConfig } from "../Instantiable.abstract"

/**
 * Assets submodule of Ocean Protocol.
 */
export class OceanAssets extends Instantiable {

    /**
     * Returns the instance of OceanAssets.
     * @return {Promise<OceanAssets>}
     */
    public static async getInstance(config: InstantiableConfig): Promise<OceanAssets> {
        const instance = new OceanAssets()
        instance.setInstanceConfig(config)

        return instance
    }

    /**
     * Returns a DDO by DID.
     * @param  {string} did Decentralized ID.
     * @return {Promise<DDO>}
     */
    public async resolve(did: string): Promise<DDO> {
        const d: DID = DID.parse(did)
        return this.ocean.aquarius.retrieveDDO(d)
    }

    /**
     * Creates a new DDO.
     * @param  {MetaData} metadata DDO metadata.
     * @param  {Account} publisher Publisher account.
     * @return {Promise<DDO>}
     */
    public async create(metadata: MetaData, publisher: Account, services: Service[] = []): Promise<DDO> {
        const {secretStoreUri} = this.config
        const {didRegistry, templates} = this.ocean.keeper

        const did: DID = DID.generate()

        const authorizationService = (services.find(({type}) => type === "Authorization") || {}) as ServiceAuthorization
        const secretStoreUrl = authorizationService.service === "SecretStore" && authorizationService.serviceEndpoint

        const encryptedFiles = await this.ocean.secretStore.encrypt(did.getId(), metadata.base.files, null, secretStoreUrl)

        const serviceAgreementTemplate = await templates.escrowAccessSecretStoreTemplate.getServiceAgreementTemplate()

        const serviceEndpoint = this.ocean.aquarius.getServiceEndpoint(did)

        let serviceDefinitionIdCount = 0
        // create ddo itself
        const ddo: DDO = new DDO({
            id: did.getDid(),
            authentication: [{
                type: "RsaSignatureAuthentication2018",
                publicKey: did.getDid() + "#keys-1",
            }],
            publicKey: [
                {
                    id: did.getDid() + "#keys-1",
                    type: "Ed25519VerificationKey2018",
                    owner: did.getDid(),
                    publicKeyBase58: await publisher.getPublicKey(),
                },
            ],
            service: [
                {
                    type: "Access",
                    purchaseEndpoint: this.ocean.brizo.getPurchaseEndpoint(),
                    serviceEndpoint: this.ocean.brizo.getConsumeEndpoint(),
                    serviceDefinitionId: String(serviceDefinitionIdCount++),
                    templateId: templates.escrowAccessSecretStoreTemplate.getAddress(),
                    serviceAgreementTemplate,
                },
                {
                    type: "Compute",
                    serviceEndpoint: this.ocean.brizo.getComputeEndpoint(publisher.getId(), String(serviceDefinitionIdCount), "xxx", "xxx"),
                    serviceDefinitionId: String(serviceDefinitionIdCount++),
                },
                {
                    type: "Authorization",
                    services: "SecretStore",
                    serviceEndpoint: secretStoreUri,
                    serviceDefinitionId: String(serviceDefinitionIdCount++),
                },
                {
                    type: "Metadata",
                    serviceEndpoint,
                    serviceDefinitionId: String(serviceDefinitionIdCount++),
                    metadata: {
                        // Default values
                        curation: {
                            rating: 0,
                            numVotes: 0,
                        },
                        additionalInformation: {
                            updateFrecuency: "yearly",
                            structuredMarkup: [],
                        },
                        // Overwrites defaults
                        ...metadata,
                        // Cleaning not needed information
                        base: {
                            ...metadata.base,
                            contentUrls: [],
                            encryptedFiles,
                            files: metadata.base.files
                                .map((file, index) => ({
                                    ...file,
                                    index,
                                    url: undefined,
                                })),
                        } as any,
                    },
                },
                ...services
                    .map((_) => ({..._, serviceDefinitionId: String(serviceDefinitionIdCount++)})),
            ]
                // Remove duplications
                .reverse()
                .filter(({type}, i, list) => list.findIndex(({type: t}) => t === type) === i)
                .reverse() as Service[],
        })

        // Overwritte initial service agreement conditions
        const rawConditions = await templates.escrowAccessSecretStoreTemplate.getServiceAgreementTemplateConditions()
        const conditions = fillConditionsWithDDO(rawConditions, ddo)
        serviceAgreementTemplate.conditions = conditions

        ddo.addChecksum()
        await ddo.addProof(this.ocean, publisher.getId(), publisher.getPassword())

        const storedDdo = await this.ocean.aquarius.storeDDO(ddo)
        await didRegistry.registerAttribute(
            did.getId(),
            ddo.getChecksum(),
            serviceEndpoint,
            publisher.getId(),
        )

        return storedDdo
    }

    // tslint:disable-next-line
    public async consume(agreementId: string, did: string, serviceDefinitionId: string, consumerAccount: Account, resultPath: string): Promise<string>
    public async consume(agreementId: string, did: string, serviceDefinitionId: string, consumerAccount: Account): Promise<true>
    public async consume(
        agreementId: string,
        did: string,
        serviceDefinitionId: string,
        consumerAccount: Account,
        resultPath?: string,
    ): Promise<string | true> {

        const ddo = await this.resolve(did)
        const {metadata} = ddo.findServiceByType("Metadata")

        const authorizationService = ddo.findServiceByType("Authorization")
        const accessService = ddo.findServiceById(serviceDefinitionId)

        const files = metadata.base.encryptedFiles

        const {serviceEndpoint} =  accessService

        if (!serviceEndpoint) {
            throw new Error("Consume asset failed, service definition is missing the `serviceEndpoint`.")
        }

        const secretStoreUrl = authorizationService.service === "SecretStore" && authorizationService.serviceEndpoint

        this.logger.log("Decrypting files")
        const decryptedFiles = await this.ocean.secretStore
            .decrypt(did, files, consumerAccount, secretStoreUrl)
        this.logger.log("Files decrypted")

        this.logger.log("Consuming files")

        resultPath = resultPath ? `${resultPath}/datafile.${ddo.shortId()}.${agreementId}/` : undefined
        await this.ocean.brizo.consumeService(
            agreementId,
            serviceEndpoint,
            consumerAccount,
            decryptedFiles,
            resultPath,
        )
        this.logger.log("Files consumed")

        if (resultPath) {
            return resultPath
        }
        return true
    }

    /**
     * Start the purchase/order of an asset's service. Starts by signing the service agreement
     * then sends the request to the publisher via the service endpoint (Brizo http service).
     * @param  {string} did Decentralized ID.
     * @param  {string} serviceDefinitionId Service definition ID.
     * @param  {Account} consumer Consumer account.
     * @return {Promise<string>} Returns Agreement ID
     */
    public async order(
        did: string,
        serviceDefinitionId: string,
        consumer: Account,
    ): Promise<string> {

        const oceanAgreements = this.ocean.agreements

        this.logger.log("Asking for agreement signature")
        const {agreementId, signature} = await oceanAgreements.prepare(did, serviceDefinitionId, consumer)
        this.logger.log(`Agreement ${agreementId} signed`)

        const ddo = await this.resolve(did)

        const keeper = this.ocean.keeper
        const templateName = ddo.findServiceByType("Access").serviceAgreementTemplate.contractName
        const template = keeper.getTemplateByName(templateName)
        const accessCondition = keeper.conditions.accessSecretStoreCondition

        const paymentFlow = new Promise(async (resolve, reject) => {
            await template.getAgreementCreatedEvent(agreementId).once()

            this.logger.log("Agreement initialized")

            const {metadata} = ddo.findServiceByType("Metadata")

            this.logger.log("Locking payment")

            const paid = await oceanAgreements.conditions.lockReward(agreementId, metadata.base.price, consumer)

            if (paid) {
                this.logger.log("Payment was OK")
            } else {
                this.logger.error("Payment was KO")
                this.logger.error("Agreement ID: ", agreementId)
                this.logger.error("DID: ", ddo.id)
                reject("Error on payment")
            }

            await accessCondition.getConditionFulfilledEvent(agreementId).once()

            this.logger.log("Access granted")
            resolve()
        })

        this.logger.log("Sending agreement request")
        await oceanAgreements.send(did, agreementId, serviceDefinitionId, signature, consumer)
        this.logger.log("Agreement request sent")

        try {
            await paymentFlow
        } catch (e) {
            throw new Error("Error paying the asset.")
        }

        return agreementId
    }

    /**
     * Search over the assets using a query.
     * @param  {SearchQuery} query Query to filter the assets.
     * @return {Promise<DDO[]>}
     */
    public async query(query: SearchQuery): Promise<DDO[]> {
        return this.ocean.aquarius.queryMetadata(query)
    }

    /**
     * Search over the assets using a keyword.
     * @param  {SearchQuery} text Text to filter the assets.
     * @return {Promise<DDO[]>}
     */
    public async search(text: string): Promise<DDO[]> {
        return this.ocean.aquarius.queryMetadataByText({
            text,
            page: 0,
            offset: 100,
            query: {
                value: 1,
            },
            sort: {
                value: 1,
            },
        } as SearchQuery)
    }
}
