export interface IUser {
    id: number;
    email: string;
    name: string;
    surname: string;
    is_active: boolean;
    is_banned: boolean;
    is_staff: boolean;
    last_login: string | null;
    avatar_hash: string;
    created_at: string;
    updated_at: string;
    /** Embedded order statistics from the list endpoint (GET /users). */
    statistic?: IUserStatistic;
}

export interface IUserStatistic {
    total: number;
    new: number;
    in_work: number;
    agree: number;
    disagree: number;
    dubbing: number;
}

export interface IUserCreateRequest {
    email: string;
    name: string;
    surname: string;
}

export interface IUserActionLinkResponse {
    details: string;
    link: string;
    verify_token: string;
}
