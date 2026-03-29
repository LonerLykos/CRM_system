import { cookies } from "next/headers";
import {api_url, public_api_url} from "@/shared/config/urls";

interface AuthHeadersResult {
    baseUrl: string;
    baseHeaders: Record<string, string>;
}

export async function getAuthHeaders(): Promise<AuthHeadersResult> {
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer ? api_url : public_api_url;

    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',

    }

    if (isServer) {
        const cookieStore = await cookies()
        const cookieString = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ')
        if (cookieString) {
            baseHeaders['Cookie'] = cookieString;
        }
    }
    return {baseUrl, baseHeaders}
}