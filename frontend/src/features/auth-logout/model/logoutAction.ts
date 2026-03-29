'use server'

import {authService} from "@/entities/auth";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";


export async function logoutAction(): Promise<void> {
    await authService.logout()
    const cookieStore = await cookies()
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')

    redirect('/auth')

}