export type SortDirection = 'asc' | 'desc';

export function sortDirection(order: string | undefined, field: string): SortDirection | null {
    if (!order) return null;

    const desc = order.startsWith('-');
    const active = desc ? order.slice(1) : order;

    return active === field ? (desc ? 'desc' : 'asc') : null;
}
