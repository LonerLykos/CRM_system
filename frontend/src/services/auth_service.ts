import {axiosInstance} from "./api.service.ts";
import {urls} from "../constants/urls.ts";
import type {IActiveUserData} from "../models/activeUserData.ts";

export type LoginData = {
    email: string;
    password: string;
}


export const authService = {
    async login(LoginData: LoginData): Promise<IActiveUserData> {
        const {data}= await  axiosInstance.post(urls.auth.login, LoginData);
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