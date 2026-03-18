import {api, IPaginatedResponse, QueryParams} from "@/shared/api";
import {urls} from "@/shared/config";



export const userService = {
    getAllUsers: <T>(params?: QueryParams) => api.get<IPaginatedResponse<T>>(
        urls.admin.users, params
    ),

}


