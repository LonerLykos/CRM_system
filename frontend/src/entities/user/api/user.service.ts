import {api, IPaginatedResponse} from "@/shared/api";
import {urls} from "@/shared/config";
import {IUser, IUserActionLinkResponse, IUserCreateRequest, IUserStatistic} from "@/entities/user";

const BASE = urls.admin.users;

export const userService = {
    getAllUsers: (params?: { page?: string; size?: string }) =>
        api.get<IPaginatedResponse<IUser>>(BASE, params),

    createUser: (body: IUserCreateRequest) =>
        api.post<IUserActionLinkResponse, IUserCreateRequest>(
            `${BASE}/create_user`,
            body,
        ),

    banToggle: (pk: number) =>
        api.patch<IUser, Record<string, never>>(`${BASE}/${pk}/ban_toggle`, {}),

    restorePassword: (pk: number) =>
        api.patch<IUserActionLinkResponse, Record<string, never>>(
            `${BASE}/${pk}/restore_password`,
            {},
        ),

    getStatistic: () =>
        api.get<IUserStatistic>(`${BASE}/statistic`),

    getUserStatistic: (pk: number) =>
        api.get<IUserStatistic>(`${BASE}/${pk}/statistic`),
};
