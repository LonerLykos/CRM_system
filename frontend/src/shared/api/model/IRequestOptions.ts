import {QueryParams} from "@/shared/api";

export interface IRequestOptions<B> {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: B;
    headers?: Record<string, string>;
    params?: QueryParams;
}
