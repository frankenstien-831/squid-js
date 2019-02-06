import { MetaData } from "../../src/ddo/MetaData"

export const metadataMock: MetaData = {
    base: {
        name: "UK Weather information 2011",
        type: "dataset",
        description: "Weather information of UK including temperature and humidity",
        size: "3.1gb",
        dateCreated: "2012-10-10T17:00:000Z",
        author: "Met Office",
        license: "CC-BY",
        copyrightHolder: "Met Office",
        encoding: "UTF-8",
        compression: "zip",
        contentType: "text/csv",
        workExample: "423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
        files: [
            {
                url: "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
                checksum: "085340abffh21495345af97c6b0e761",
                contentLength: "12324",
            },
            {
                url: "https://testocnfiles.blob.core.windows.net/testfiles/testzkp2.zip",
            },
        ],
        links: [
            {
                // tslint:disable-next-line
                sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/"
            },
            {
                // tslint:disable-next-line
                sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/"
            },
            {
                fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/",
            },
        ],
        inLanguage: "en",
        tags: "weather, uk, 2011, temperature, humidity",
        price: 10,
        checksum: "",
    },
    curation: {
        rating: 0.93,
        numVotes: 123,
        schema: "Binary Votting",
    },
    additionalInformation: {
        updateFrecuency: "yearly",
        structuredMarkup: [
            {
                uri: "http://skos.um.es/unescothes/C01194/jsonld",
                mediaType: "application/ld+json",
            },
            {
                uri: "http://skos.um.es/unescothes/C01194/turtle",
                mediaType: "text/turtle",
            },
        ],
        checksum: "",
    },
}
