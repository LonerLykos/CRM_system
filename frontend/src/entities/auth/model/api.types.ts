export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ILoginResponse {
    message: string;
    access_token: string;
    refresh_token: string;
}

export interface ICurrentUser {
    name: string;
    surname: string;
    is_staff: boolean | string;
    avatar_hash: string;
}
