import {urls} from "@/shared/config/urls";
import {api} from "@/shared/api/base/api.services";
import {ICurrentUser, ILoginRequest, ILogoutResponse} from "@/entities/auth/model/api.types";
import {ITokenPair} from "@/shared/api/model/ITokenPair";


export const authService = {
    login: (data: ILoginRequest) => api.post<ITokenPair, ILoginRequest>(
        `${urls.auth.login}`,
        data
    ),
    getMe: () => api.get<ICurrentUser>(
        urls.auth.currentUser
    ),
    logout: () => api.post<ILogoutResponse>(
        urls.auth.logout,
    ),
};


