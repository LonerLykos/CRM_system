import {Navigate, useRoutes} from "react-router-dom";
import {lazy} from "react";
import {AppRoutes} from "./constants.ts";
import {ProtectedRoute} from "./ProtectedRoute.tsx";
import {useAuthStore} from "../store/useAuthStore.ts";

const Main = lazy(() => import('../pages/main/MainPage.tsx'))
const Login = lazy(() => import('../pages/login/LoginPage.tsx'))


export const RoutesComponent = () => {

    const {isAuthenticated} = useAuthStore()

    return useRoutes([
        {
            element: (
                <ProtectedRoute>
                    <Main/>
                </ProtectedRoute>
            ),
            path: AppRoutes.root,
        },
        {
            element: (
                isAuthenticated ? <Navigate to={AppRoutes.root} replace /> : <Login />
            ),
            path: AppRoutes.login,
        },
    ])
}
