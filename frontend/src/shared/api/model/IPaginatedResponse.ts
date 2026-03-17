export interface IPaginatedResponse<T> {
    total_items: number,
    total_pages: number,
    prev: boolean,
    next: boolean,
    data: T[]
}