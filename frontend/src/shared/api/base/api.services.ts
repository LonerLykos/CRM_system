import {IRequestsErrors} from "@/shared/api/model/IRequestsErrors";
import {api_url, public_api_url} from "@/shared/config/urls";
import {cookies} from "next/headers";

interface RequestOptions<B> {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: B;
    headers?: Record<string, string>;
}

export async function request<R, B = undefined>(endpoint: string, options: RequestOptions<B> = {}): Promise<R | IRequestsErrors> {
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer ? api_url : public_api_url;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    }

    if (isServer) {
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ')
        if (cookieString) {
            headers['Cookie'] = cookieString;
        }
    }

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: options.method || 'GET',
            cache: "no-store",
            headers,
            ...(options.body && {body: JSON.stringify(options.body)}),
        });

        if (!response.ok) {
            const {status, statusText} = response;
            const errorDetail = await response.json().catch(() => ({}));
            return {status, statusText, ...errorDetail} as IRequestsErrors;
        }

        // ПІД ПИТАННЯМ
        if (response.status === 204) {
            return {} as R;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error (${options.method} ${endpoint}):`, error);
        return {status: 500, statusText: 'Network Error'} as IRequestsErrors;
    }
}

export async function getData<R>(endpoint: string): Promise<R | IRequestsErrors> {
    return request<R>(endpoint, {method: 'GET'});
}

export async function postData<R, B>(endpoint: string, data: B): Promise<R | IRequestsErrors> {
    return request<R, B>(endpoint, {
        method: 'POST',
        body: data
    });
}

export async function patchData<R, B>(endpoint: string, data: B): Promise<R | IRequestsErrors> {
    return request<R, B>(endpoint, {
        method: 'PATCH',
        body: data
    });
}

//  ПОДИВИТИСЬ ПОТІМ
export async function deleteData<R>(endpoint: string): Promise<R | IRequestsErrors> {
    const result = await request<R>(endpoint, {method: 'DELETE'});
    return result;
}