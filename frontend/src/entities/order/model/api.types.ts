export interface IOrderResponse{
    id: number,
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
    created_at: string,
    utm?: string,
    msg?: string,
    status?: string,
    group?: string,
    manager?: string,

}

export type OrderBase = Omit<IOrderResponse, 'utm' | 'msg'>

export interface IOrderDetailResponse<T> extends IOrderResponse {
    comments: T[] | [],
}
