export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ICurrentUser {
    name: string;
    surname: string;
    is_staff: boolean;
    avatar_hash: string;
}

export interface ILogoutResponse {
    status: number;
    message: string
}
