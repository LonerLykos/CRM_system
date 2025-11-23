import {IActiveUserData} from "@/models/users-models/activeUserData";
import {axiosInstance} from "@/services/api.services";
import {urls} from "@/config/urls";


export const authService = {
    async login(email:string, password: string): Promise<IActiveUserData> {
        const {data}= await  axiosInstance.post(urls.auth.login, {email, password});
        return data
    },

    async refresh(): Promise<number> {
        const {status} = await axiosInstance.post(urls.auth.refresh)
        return status
    },

    async logout() {
        await axiosInstance.post(urls.auth.logout)
    }
}