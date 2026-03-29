import {IRequestsErrors} from "@/shared/api/model/IRequestsErrors";
import {getAuthHeaders} from "@/shared/libs/api/get-auth-headers";
import {IRequestOptions, WrappedResponse} from "@/shared/api";

export async function request<R, B = undefined>(
    endpoint: string,
    options: IRequestOptions<B> = {}
): Promise<WrappedResponse<R>> {
    const {baseUrl, baseHeaders: authHeaders} = await getAuthHeaders()

    const headers: Record<string, string> = {
        ...authHeaders,
        ...options.headers,
    }

    let fullUrl = `${baseUrl}${endpoint}`;

    if (options.params) {
        const queryParams = new URLSearchParams();

        Object.entries(options.params).forEach(([key, value]) => {
            if (value === undefined) {
                return
            }

            if (value === null) {
                queryParams.append(key, "");
                return;
            }

            queryParams.append(key, String(value));
        });

        const queryString = queryParams.toString();
        if (queryString) fullUrl += `?${queryString}`;
    }

    try {
        const response = await fetch(`${fullUrl}`, {
            method: options.method || 'GET',
            cache: "no-store",
            headers,
            ...(options.body && {body: JSON.stringify(options.body)}),
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({}));
            return {
                ok: false,
                status: response.status,
                result: null,
                error: {statusText: response.statusText, ...errorDetail},
            } as WrappedResponse<R>;
        }

        if (response.status === 204) {
            return {
                ok: true,
                status: response.status,
                result: {} as R,
                error: null,
            } as WrappedResponse<R>;
        }

        const data = await response.json()
        return {
            ok: true,
            status: response.status,
            result: data as R,
            error: null,
        } as WrappedResponse<R>;

    } catch (error) {
        return {
            ok: false,
            status: 500,
            result: null,
            error: {
                statusText: 'Network Error',
                detail: String(error),
            } as IRequestsErrors,
        } as WrappedResponse<R>;
    }
}
