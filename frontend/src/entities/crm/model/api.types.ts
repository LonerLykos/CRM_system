export interface IGroupResponse {
    id: number,
    name: string,
}

export interface ICreateGroupBody {
    name: string,
}

export interface IChoicesResponse {
    course: Record<string, string>,
    course_type: Record<string, string>,
    course_format: Record<string, string>,
    status: Record<string, string>,
}
