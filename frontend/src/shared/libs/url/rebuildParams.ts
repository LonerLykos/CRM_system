import {ISearchParams} from "@/shared/model";


export function rebuildParams(params: ISearchParams, newValue: Partial<ISearchParams>): string {
    let merged = {...params, ...newValue}

    const isSameOrder = newValue.orderId && params.orderId === newValue.orderId;

    const isPageChanging = !!newValue.page;

    if (isSameOrder || isPageChanging) {
        const { orderId, ...rest } = merged;
        merged = rest;
    }

    const cleanParams = Object.fromEntries(
        Object.entries(merged)
            .filter(([_, v]) => v != null && v !== "")
    );
    return new URLSearchParams(cleanParams as Record<string, string>).toString();
}