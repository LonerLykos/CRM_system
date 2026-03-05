import {request} from "@/shared/api/base/request";

export const api = {
    get: <R>(url:string) => request<R>(url, {method: 'GET'}),
    post: <R, B>(url: string, body: B) => request<R, B>(url, {method: 'POST', body}),
    patch: <R, B>(url: string, body: B) => request<R, B>(url, {method: 'PATCH', body}),
    delete: <R>(url:string) => request<R>(url, {method: 'DELETE'}),
}
