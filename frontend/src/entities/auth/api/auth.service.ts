import {ICurrentUser, ILoginRequest, ILogoutResponse} from "@/entities/auth";
import {api, ITokenPair} from "@/shared/api";
import {urls} from "@/shared/config";


export const authService = {
    login: (data: ILoginRequest) => api.post<ITokenPair, ILoginRequest>(
        urls.auth.login,
        data
    ),
    getMe: () => api.get<ICurrentUser>(
        urls.auth.currentUser
    ),
    logout: () => api.post<ILogoutResponse>(
        urls.auth.logout,
    ),
};


