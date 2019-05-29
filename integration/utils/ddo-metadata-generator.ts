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
              name: "Sample of Asset Data",
              type: "sample",
              url: "https://foo.com/sample.csv",
            },
            {
              name: "Data Format Definition",
              type: "format",
              url: "https://foo.com/sample.csv",
            },
        ],
        inLanguage: "en",
        categories: ["Economy", "Data Science"],
        tags: ["weather", "uk", "2011", "temperature", "humidity"],
        price: "21" + "0".repeat(18),
        files: [
            {
                index: 0,
                url: "https://raw.githubusercontent.com/oceanprotocol/squid-js/develop/package.json",
            },
            {
                index: 1,
                url: "https://raw.githubusercontent.com/oceanprotocol/squid-js/develop/README.md",
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
