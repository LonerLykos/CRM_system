import {QueryParams, request} from "@/shared/api";


export const api = {
    get: <R>(url: string, params?: QueryParams) => request<R>(url, {method: 'GET', params}),
    post: <R, B = void>(url: string, body?: B) => request<R, B>(url, {method: 'POST', body}),
    patch: <R, B>(url: string, body: B) => request<R, B>(url, {method: 'PATCH', body}),
    delete: <R>(url:string) => request<R>(url, {method: 'DELETE'}),
}
