import {api, IPaginatedResponse} from "@/shared/api";
import {urls} from "@/shared/config";



export const userService = {
    getAllUsers: <T>() => api.get<IPaginatedResponse<T>>(
        urls.admin.users,
    ),

}


