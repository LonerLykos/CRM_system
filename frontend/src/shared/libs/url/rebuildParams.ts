import {ISearchParams} from "@/shared/model";
import {cleanParams} from "@/shared/libs";


export function rebuildParams(params: ISearchParams, newValue: Partial<ISearchParams>): string {
    let merged = {...params, ...newValue}

    const isSameOrder = newValue.orderId && params.orderId === newValue.orderId;

    const isPageChanging = !!newValue.page;

    if (isSameOrder || isPageChanging) {
        const {orderId, ...rest} = merged;
        merged = rest;
    }

    if (Object.keys(newValue).length > 0 && !('error' in newValue)) {
        const {error, ...rest} = merged
        merged = rest
    }

    return cleanParams(merged)
}
