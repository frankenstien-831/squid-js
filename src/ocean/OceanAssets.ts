import AquariusProvider from "../aquarius/AquariusProvider"
import { SearchQuery } from "../aquarius/query/SearchQuery"
import BrizoProvider from "../brizo/BrizoProvider"
import { Condition } from "../ddo/Condition"
import { DDO } from "../ddo/DDO"
import { MetaData } from "../ddo/MetaData"
import { Service } from "../ddo/Service"
import Keeper from "../keeper/Keeper"
import SecretStoreProvider from "../secretstore/SecretStoreProvider"
import Account from "./Account"
import DID from "./DID"
import OceanAgreements from "./OceanAgreements"
import ServiceAgreementTemplate from "./ServiceAgreements/ServiceAgreementTemplate"
import Access from "./ServiceAgreements/Templates/Access"

/**
 * Assets submodule of Ocean Protocol.
 */
export default class OceanAssets {

    /**
     * Returns the instance of OceanAssets.
     * @return {Promise<OceanAssets>}
     */
    public static async getInstance(): Promise<OceanAssets> {
        if (!OceanAssets.instance) {
            OceanAssets.instance = new OceanAssets()
        }

        return OceanAssets.instance
    }

    /**
     * OceanAssets instance.
     * @type {OceanAssets}
     */
    private static instance: OceanAssets = null

    /**
     * Returns a DDO by DID.
     * @param  {string} did Decentralized ID.
     * @return {Promise<DDO>}
     */
    public async resolve(did: string): Promise<DDO> {
        const d: DID = DID.parse(did)
        return AquariusProvider.getAquarius().retrieveDDO(d)
    }

    /**
     * Creates a new DDO.
     * @param  {MetaData} metadata DDO metadata.
     * @param  {Account} publisher Publisher account.
     * @return {Promise<DDO>}
     */
    public async create(metadata: MetaData, publisher: Account, services: Service[] = []): Promise<DDO> {
        const {secretStoreUri} = ConfigProvider.getConfig()
        const {didRegistry} = await Keeper.getInstance()
        const aquarius = AquariusProvider.getAquarius()
        const brizo = BrizoProvider.getBrizo()

        const did: DID = DID.generate()

        const authorizationService = (services.find(({type}) => type === "Authorization") || {}) as ServiceAuthorization
        const secretStoreUrl = authorizationService.service === "SecretStore" && authorizationService.serviceEndpoint
        const secretStoreConfig = {
            secretStoreUri: secretStoreUrl,
        }

        const encryptedFiles = await SecretStoreProvider.getSecretStore(secretStoreConfig).encryptDocument(did.getId(), metadata.base.files)

        const template = new Access()
        const serviceAgreementTemplate = new ServiceAgreementTemplate(template)

        const conditions: Condition[] = await serviceAgreementTemplate.getConditions(metadata, did.getId())

        const serviceEndpoint = aquarius.getServiceEndpoint(did)

        let serviceDefinitionIdCount = 0
        // create ddo itself
        const ddo: DDO = new DDO({
            authentication: [{
                type: "RsaSignatureAuthentication2018",
                publicKey: did.getDid() + "#keys-1",
            }],
            id: did.getDid(),
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
                    type: template.templateName,
                    purchaseEndpoint: brizo.getPurchaseEndpoint(),
                    serviceEndpoint: brizo.getConsumeEndpoint(),
                    // the id of the service agreement?
                    serviceDefinitionId: String(serviceDefinitionIdCount++),
                    // the id of the service agreement template
                    templateId: serviceAgreementTemplate.getId(),
                    serviceAgreementContract: {
                        contractName: "ServiceExecutionAgreement",
                        fulfillmentOperator: template.fulfillmentOperator,
                        events: [
                            {
                                name: "AgreementInitialized",
                                actorType: "consumer",
                                handler: {
                                    moduleName: "payment",
                                    functionName: "lockPayment",
                                    version: "0.1",
                                },
                            },
                        ],
                    },
                    conditions,
                },
                {
                    type: "Compute",
                    serviceEndpoint: brizo.getComputeEndpoint(publisher.getId(), String(serviceDefinitionIdCount), "xxx", "xxx"),
                    serviceDefinitionId: String(serviceDefinitionIdCount++),
                },
                {
                    type: "Authorization",
                    services: 'SecretStore',
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
                            files: undefined,
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

        ddo.addChecksum()
        await ddo.addProof(publisher.getId(), publisher.getPassword())

        const storedDdo = await aquarius.storeDDO(ddo)

        await didRegistry.registerAttribute(
            did.getId(),
            ddo.getChecksum(),
            serviceEndpoint,
            publisher.getId(),
        )

        return storedDdo
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

        const oceanAreements = await OceanAgreements.getInstance()

        const {agreementId, signature} = await oceanAreements.prepare(did, serviceDefinitionId, consumer)
        await oceanAreements.send(did, agreementId, serviceDefinitionId, signature, consumer)

        return agreementId
    }

    /**
     * Search over the assets using a query.
     * @param  {SearchQuery} query Query to filter the assets.
     * @return {Promise<DDO[]>}
     */
    public async query(query: SearchQuery): Promise<DDO[]> {
        return AquariusProvider.getAquarius().queryMetadataByText(query)
    }

    /**
     * Search over the assets using a keyword.
     * @param  {SearchQuery} text Text to filter the assets.
     * @return {Promise<DDO[]>}
     */
    public async search(text: string): Promise<DDO[]> {
        return AquariusProvider.getAquarius().queryMetadataByText({
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
