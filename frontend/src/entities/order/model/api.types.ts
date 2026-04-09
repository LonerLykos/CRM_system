export interface IOrderRequest {
    name?: string,
    surname?: string,
    email?: string,
    phone?: string,
    age?: number,
    course?: string,
    course_format?: string,
    course_type?: string,
    sum?: number,
    already_paid?: number,
    status?: string,
    group?: string,
}

export interface IOrderResponse extends IOrderRequest{
    id: number,
    created_at: string,
    utm?: string,
    msg?: string,
    manager?: string,
}

export type OrderBase = Omit<IOrderResponse, 'utm' | 'msg'>

export interface IOrderDetailResponse<T> extends IOrderResponse {
    comments: T[] | [],
}
