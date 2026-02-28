import {baseUrl} from "@/config/urls";
import {IRequestsErrors} from "@/models/errors/IRequestsErrors";

export async function getData<T>(endpoint: string): Promise<T | IRequestsErrors> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        const {status, statusText} = response;
        return {status, statusText}
    }

    return response.json();
}

export async function postData<T, R>(endpoint: string, data: T): Promise<R | IRequestsErrors> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const {status, statusText} = response;
        return {status, statusText}
    }

    return response.json();
}

export async function patchData<T, R>(endpoint: string, data: T): Promise<R | IRequestsErrors> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const {status, statusText} = response;
        return {status, statusText}
    }

    return response.json();
}

export async function deleteData(endpoint: string): Promise<void | IRequestsErrors> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const {status, statusText} = response;
        return {status, statusText}
    }
}
