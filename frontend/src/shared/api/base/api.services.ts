import {IRequestsErrors} from "@/shared/api/model/IRequestsErrors";
import {api_url, public_api_url} from "@/shared/config/urls";

interface RequestOptions<B> {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: B;
    headers?: Record<string, string>;
}

export async function request<R, B = undefined>(endpoint: string, options: RequestOptions<B> = {}): Promise<R | IRequestsErrors> {
    const isServer = typeof window === 'undefined';

    const baseUrl = isServer ? api_url : public_api_url;

    const { method = 'GET', body, headers } = options;

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method,
            cache: "no-store",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...headers,
            },

            ...(body && { body: JSON.stringify(body) }),
        });

        if (!response.ok) {
            const { status, statusText } = response;
            const errorDetail = await response.json().catch(() => ({}));
            return { status, statusText, ...errorDetail } as IRequestsErrors;
        }

        // ПІД ПИТАННЯМ
        if (response.status === 204) {
            return {} as R;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error (${method} ${endpoint}):`, error);
        return { status: 500, statusText: 'Network Error' } as IRequestsErrors;
    }
}

export async function getData<R>(endpoint: string): Promise<R | IRequestsErrors> {
    return request<R>(endpoint, { method: 'GET' });
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
    const result = await request<R>(endpoint, { method: 'DELETE' });
    return result;
}