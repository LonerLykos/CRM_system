import axios from 'axios';
import {baseUrl} from "../constants/urls.ts";
import {authService} from "./auth_service.ts";


export const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {"Content-Type": "application/json"},
    withCredentials: true,
})


axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const status = await authService.refresh();

                if (status === 200) {
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.log('Refresh error', refreshError)
                await authService.logout()
                window.location.href = '/login'
            }
        }

        return Promise.reject(error);
    }
);


