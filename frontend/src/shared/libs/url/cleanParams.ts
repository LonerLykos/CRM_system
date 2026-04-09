import {ISearchParams} from "@/shared/model";

export function cleanParams(params: ISearchParams) {
    const cleanParams = Object.fromEntries(
        Object.entries(params)
            .filter(([_, v]) => v != null && v !== "")
    );
    return new URLSearchParams(cleanParams as Record<string, string>).toString();
}
