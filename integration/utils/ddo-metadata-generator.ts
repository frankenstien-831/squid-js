import { MetaData } from "../../src" // @oceanprotocol/squid

const metadata: Partial<MetaData> = {
    base: {
        name: undefined,
        type: "dataset",
        description: "Weather information of UK including temperature and humidity",
        dateCreated: "2012-10-10T17:00:000Z",
        datePublished: "2012-10-10T17:00:000Z",
        author: "Met Office",
        license: "CC-BY",
        copyrightHolder: "Met Office",
        workExample: "423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
        links: [
            {
                sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/",
            },
            {
                sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/",
            },
            {
                fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/",
            },
        ],
        inLanguage: "en",
        categories: ["Economy", "Data Science"],
        tags: ["weather", "uk", "2011", "temperature", "humidity"],
        price: 10,
        files: [
            {
                url: "234ab87234acbd09543085340abffh21983ddhiiee982143827423421",
                checksum: "efb2c764274b745f5fc37f97c6b0e761",
                contentLength: 4535431,
                resourceId: "access-log2018-02-13-15-17-29-18386C502CAEA932",
            },
            {
                url: "234ab87234acbd6894237582309543085340abffh21983ddhiiee982143827423421",
                checksum: "085340abffh21495345af97c6b0e761",
                contentLength: 12324,
            },
            {
                url: "80684089027358963495379879a543085340abffh21983ddhiiee982143827abcc2",
            },
        ],
    },
}

export const generateMetadata = (name: string): Partial<MetaData> => ({
    ...metadata,
    base: {
        ...metadata.base,
        name,
    },
})

export const getMetadata = () => generateMetadata("TestAsset")
