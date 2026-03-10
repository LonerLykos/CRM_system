import {IRequestsErrors} from "@/shared/api/model/IRequestsErrors";
import {refresh} from "@/shared/api/auth-refresh/refresh";
import {getAuthHeaders} from "@/shared/libs/api/get-auth-headers";



interface RequestOptions<B> {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: B;
    headers?: Record<string, string>;
}

export async function request<R, B = undefined>(
    endpoint: string,
    options: RequestOptions<B> = {}
): Promise<R | IRequestsErrors> {
    const {baseUrl, baseHeaders: authHeaders} = await getAuthHeaders()

    const headers: Record<string, string> = {
        ...authHeaders,
        ...options.headers,
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
