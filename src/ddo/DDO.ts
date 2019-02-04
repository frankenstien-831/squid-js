import { Authentication } from "./Authentication"
import { PublicKey } from "./PublicKey"
import { Service } from "./Service"
import { Proof } from "./Proof"

/**
 * DID Descriptor Object.
 * Contains all the data related to an asset.
 */
export class DDO {

    /**
     * Serializes the DDO object.
     * @param  {DDO} DDO to be serialized.
     * @return {string} DDO serialized.
     */
    public static serialize(ddo: DDO): string {
        return JSON.stringify(ddo, null, 2)
    }

    /**
     * Deserializes the DDO object.
     * @param  {DDO} DDO to be deserialized.
     * @return {string} DDO deserialized.
     */
    public static deserialize(ddoString: string): DDO {
        const ddo = JSON.parse(ddoString)

        return ddo as DDO
    }

    public "@context": string = "https://w3id.org/future-method/v1"

    /**
     * DID, descentralized ID.
     * @type {string}
     */
    public id: string
    public publicKey: PublicKey[]
    public authentication: Authentication[]
    public service: Service[]
    public proof: Proof

    public constructor(ddo?: Partial<DDO>) {
        this.authentication = (ddo && ddo.authentication) || []
        this.id = (ddo && ddo.id) || null
        this.publicKey = (ddo && ddo.publicKey) || []
        this.service = (ddo && ddo.service) || []
    }

    /**
     * Finds a service of a DDO by ID.
     * @param  {string} serviceDefinitionId Service ID.
     * @return {Service} Service.
     */
    public findServiceById(serviceDefinitionId: string): Service {
        if (!serviceDefinitionId) {
            throw new Error("serviceDefinitionId not set")
        }

        const service: Service = this.service.find((s) => s.serviceDefinitionId === serviceDefinitionId)

        return service
    }

    /**
     * Finds a service of a DDO by type.
     * @param  {string} serviceType Service type.
     * @return {Service} Service.
     */
    public findServiceByType(serviceType: string): Service {
        if (!serviceType) {
            throw new Error("serviceType not set")
        }

        const service: Service = this.service.find((s) => s.type === serviceType)

        return service
    }
}
