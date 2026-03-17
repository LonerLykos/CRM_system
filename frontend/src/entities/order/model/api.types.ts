export interface IOrderResponse<T>{
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
    comments?: T[],
}

export type OrderBase = Omit<IOrderResponse<unknown>, 'comments' | 'utm' | 'msg'>