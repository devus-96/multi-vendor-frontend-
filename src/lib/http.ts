// http.ts

import axios, { AxiosHeaders, AxiosInstance, AxiosRequestHeaders } from 'axios';

export function client(customHeaders: Partial<AxiosRequestHeaders> = {}): AxiosInstance {

    const defaultHeaders: Partial<AxiosRequestHeaders> = {
        Accept: 'application/json',
    };

    return axios.create({
        headers: {
            ...defaultHeaders,
            ...customHeaders,
        },
        withCredentials: true,
    });
}

let httpInstance: AxiosInstance | undefined;

export const apiClient = (): AxiosInstance => {
    if (httpInstance) {
        return httpInstance;
    }

    const headers = AxiosHeaders.from({
        Accept: 'application/json',
    });

    const instance = axios.create({
        headers,
        withCredentials: true,
        baseURL: '/api/',
    });

    instance.interceptors.response.use(
        (res) => {
            return res;
        },
        (error) => {
            throw error;
        },
    );

    httpInstance = instance;

    return instance;
};

export const getHttpClient = client;
