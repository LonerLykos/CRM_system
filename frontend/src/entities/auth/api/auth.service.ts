import {urls} from "@/shared/config/urls";
import {postData} from "@/shared/api/base/api.services";
import {ILoginRequest, ILoginResponse} from "@/entities/auth/model/api.types";


export const authService = {
    login: (data: ILoginRequest) => postData<ILoginResponse, ILoginRequest>(`${urls.auth.login}`, data),

};


