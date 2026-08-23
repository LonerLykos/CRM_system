import type {IRequestsErrors} from "@/shared/api/model/IRequestsErrors";

const META_KEYS: ReadonlySet<string> = new Set(['statusText']);

const UNPREFIXED_KEYS: ReadonlySet<string> = new Set(['non_field_errors', 'detail']);

const firstMessage = (value: string | string[] | undefined): string => {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) {
        const found = value.find((item) => typeof item === 'string' && item.trim());
        return found ? found.trim() : '';
    }
    return '';
};

const humanize = (key: string): string => {
    const words = key.replace(/_/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
};

export function extractApiError(
    error: IRequestsErrors | null | undefined,
    fallback: string,
): string {
    if (!error) return fallback;

    const detail = firstMessage(error.detail);
    if (detail) return detail;

    const keys = Object.keys(error).filter((key) => !META_KEYS.has(key) && key !== 'detail');
    const ordered = [
        ...keys.filter((key) => key === 'non_field_errors'),
        ...keys.filter((key) => key !== 'non_field_errors'),
    ];

    for (const key of ordered) {
        const message = firstMessage(error[key]);
        if (!message) continue;

        if (UNPREFIXED_KEYS.has(key)) return message;
        if (message.toLowerCase().includes(key.replace(/_/g, ' ').toLowerCase())) return message;
        return `${humanize(key)}: ${message}`;
    }

    const statusText = firstMessage(error.statusText);
    return statusText || fallback;
}
