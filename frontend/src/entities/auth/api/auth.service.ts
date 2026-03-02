import {urls} from "@/shared/config/urls";
import {getData, postData} from "@/shared/api/base/api.services";
import {ICurrentUser, ILoginRequest, ILoginResponse} from "@/entities/auth/model/api.types";


export const authService = {
    login: (data: ILoginRequest) => postData<ILoginResponse, ILoginRequest>(`${urls.auth.login}`, data),
    getMe: () => getData<ICurrentUser>(urls.auth.currentUser)
};


