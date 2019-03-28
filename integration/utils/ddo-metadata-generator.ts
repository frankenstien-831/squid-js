import { MetaData } from "../../src" // @oceanprotocol/squid

const metadata: Partial<MetaData> = {
    base: {
        name: undefined,
        type: "dataset",
        description: "Weather information of UK including temperature and humidity",
        dateCreated: "2012-02-01T10:55:11+00:00",
        author: "Met Office",
        license: "CC-BY",
        copyrightHolder: "Met Office",
        // tslint:disable-next-line
        workExample: "stationId,latitude,longitude,datetime,temperature,humidity423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
        files: [
            {
                url: "https://raw.githubusercontent.com/oceanprotocol/squid-js/develop/package.json",
            },
            {
                url: "https://raw.githubusercontent.com/oceanprotocol/squid-js/develop/README.md",
            },
        ],
        links: [
            {sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/"},
            {sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/"},
            {fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/"},
        ],
        inLanguage: "en",
        tags: "weather, uk, 2011, temperature, humidity",
        price: 10,
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
