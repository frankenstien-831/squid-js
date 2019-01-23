import fetch, { BodyInit, RequestInit, Response } from "node-fetch"

/**
 * Provides a common interface to web services.
 */
export default class WebServiceConnector {

    public async post(url: string, payload: BodyInit): Promise<Response> {
        return this.fetch(url, {
            method: "POST",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    public async get(url: string): Promise<Response> {
        return this.fetch(url, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    public async put(url: string, payload: BodyInit): Promise<Response> {
        return this.fetch(url, {
            method: "PUT",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    private async fetch(url: string, opts: RequestInit): Promise<Response> {
        return fetch(url, opts)
    }
}
