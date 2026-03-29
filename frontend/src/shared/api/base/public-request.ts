import {WrappedResponse} from "@/shared/api";
import {api_url} from "@/shared/config/urls";

export async function publicRequest<R>(endpoint: string): Promise<WrappedResponse<R>> {
    try {
        const response = await fetch(`${api_url}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            cache: 'force-cache'
        });
        if (!response.ok) {
            return {ok: false, status: response.status, result: null, error: await response.json().catch(() => ({}))}
        }
        return {ok: true, status: response.status, result: await response.json(), error: null};
    }catch (e) {
        return {ok: false, status: 500, result: null, error: {detail: String(e)}};
    }
}
