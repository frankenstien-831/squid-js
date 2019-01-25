import AdditionalInformation from "../ddo/AdditionalInformation"
import Curation from "../ddo/Curation"
import DDO from "../ddo/DDO"
import MetaData from "../ddo/MetaData"
import MetaDataBase from "../ddo/MetaDataBase"
import Service from "../ddo/Service"
import {Account, Logger, Ocean} from "../squid"
import config from "./config"
import {runner} from "./runner"

async function exec() {
    const ocean: Ocean = await Ocean.getInstance(config)

    const publisher: Account = (await ocean.getAccounts())[0]
    const consumer: Account = (await ocean.getAccounts())[1]

    const metaData = {
        additionalInformation: {
            structuredMarkup: [
                {
                    mediaType: "application/ld+json",
                    uri: "http://skos.um.es/unescothes/C01194/jsonld",
                },
                {
                    mediaType: "text/turtle",
                    uri: "http://skos.um.es/unescothes/C01194/turtle",
                },
            ],
            updateFrecuency: "yearly",
            checksum: "efdd14d39feb726e321931f408b3454d26f1a4899bcc608a68b5397f23203174",
        } as AdditionalInformation,
        base: {
            name: "Office Humidity",
            type: "dataset",
            description: "Weather information of UK including temperature and humidity",
            size: "3.1gb",
            dateCreated: "2012-02-01T10:55:11+00:00",
            author: "Met Office",
            license: "CC-BY",
            copyrightHolder: "Met Office",
            encoding: "UTF-8",
            compression: "zip",
            contentType: "text/csv",
            // tslint:disable-next-line
            workExample: "stationId,latitude,longitude,datetime,temperature,humidity423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
            contentUrls: [
                "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
                "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
            ],
            links: [
                {sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/"},
                {sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/"},
                {fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/"},
            ],
            inLanguage: "en",
            tags: "weather, uk, 2011, temperature, humidity",
            price: 10,
        } as MetaDataBase,
        curation: {
            rating: 0.94,
            numVotes: 124,
            schema: "Binary Votting",
        } as Curation,
    }

    const ddo: DDO = await ocean.registerAsset(metaData as MetaData, publisher)
    Logger.log("did", ddo.id)

    const accessService: Service = ddo.findServiceByType("Access")

    await consumer.requestTokens(metaData.base.price)

    const serviceAgreementResult: any = await ocean
        .signServiceAgreement(
            ddo.id,
            accessService.serviceDefinitionId,
            consumer)

    Logger.log("ServiceAgreement Id:", serviceAgreementResult.serviceAgreementId)
    Logger.log("ServiceAgreement Signature:", serviceAgreementResult.serviceAgreementSignature)
}

runner(exec)
