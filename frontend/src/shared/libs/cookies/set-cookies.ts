import {cookies} from "next/headers";
import {ITokenPair} from "@/shared/api/model/ITokenPair";
import {COOKIE_OPTIONS} from "@/shared/config/cookiesOptions";


export async function setCookies(response: ITokenPair): Promise<void> {
    const cookiesStore = await cookies()

    cookiesStore.set('access_token', response.access_token, COOKIE_OPTIONS)
    cookiesStore.set('refresh_token', response.refresh_token, COOKIE_OPTIONS)
}