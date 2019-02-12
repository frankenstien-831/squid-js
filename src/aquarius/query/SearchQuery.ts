export interface SearchQuery {
    text: string
    offset: number
    page: number
    query: {[property: string]: string | number | string[] | number[]}
    sort: {[jsonPath: string]: number}
}
