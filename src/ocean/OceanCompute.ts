import { Instantiable, InstantiableConfig } from '../Instantiable.abstract'
import { MetaData } from '../ddo/MetaData'
import Account from './Account'
import { DDO } from '../ddo/DDO'

/**
 * Compute submodule of Ocean Protocol.
 */
export class OceanCompute extends Instantiable {
    /**
     * Returns the instance of OceanCompute.
     * @return {Promise<OceanCompute>}
     */
    public static async getInstance(config: InstantiableConfig): Promise<OceanCompute> {
        const instance = new OceanCompute()
        instance.setInstanceConfig(config)

        return instance
    }

    /**
     * Start the execution of a compute job.
     * @param  {string} agreementId The service agreement ID.
     * @param  {string} datasetDid The DID of the dataset asset (of type `dataset`) to run the algorithm on.
     * @param  {number} serviceIndex ID of the compute service within the dataset DDO.
     * @param  {Account} consumerAccount The account of the consumer ordering the service.
     * @param  {string} algorithmDid The DID of the algorithm asset (of type `algorithm`) to run on the asset.
     * @param  {string} algorithmRaw The raw text of the algorithm to run in the compute job (e.g. a jupyter notebook) or a valid URL to fetch the algorithm.
     * @param  {MetaData} algorithmMeta Metadata about the algorithm being run if `algorithm` is being used. This is ignored when `algorithmDid` is specified.
     * @return {Promise<string>} Returns compute job ID
     */
    public async run(
        agreementId: string,
        datasetDid: string,
        serviceIndex: number,
        consumerAccount: Account,
        algorithmDid: string,
        algorithmRaw?: string,
        algorithmMeta?: MetaData
    ): Promise<string> {
        const ddo: DDO = await this.ocean.assets.resolve(datasetDid)
        const { serviceEndpoint } = ddo.findServiceById(serviceIndex)

        const jobId = await this.ocean.brizo.computeService(
            agreementId,
            serviceEndpoint,
            consumerAccount,
            algorithmDid,
            algorithmRaw,
            algorithmMeta
        )

        return jobId
    }
}
