export interface IOrderRequest {
    name?: string | null,
    surname?: string | null,
    email?: string | null,
    phone?: string | null,
    age?: number | null,
    course?: string | null,
    course_format?: string | null,
    course_type?: string | null,
    sum?: number | null,
    already_paid?: number | null,
    status?: string | null,
    group?: string | null,
}

export interface IOrderResponse extends IOrderRequest{
    id: number,
    created_at: string,
    utm?: string,
    msg?: string,
    manager?: string,
    manager_id?: number | null,
}

export type OrderBase = Omit<IOrderResponse, 'utm' | 'msg'>

export interface IOrderDetailResponse<T> extends IOrderResponse {
    comments: T[] | [],
}
