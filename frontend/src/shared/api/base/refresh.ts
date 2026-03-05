import {request} from "@/shared/api/base/request";
import {urls} from "@/shared/config/urls";
import {ITokenPair} from "@/shared/api/model/ITokenPair";
import {setCookies} from "@/shared/libs/cookies/set-cookies";


export async function refresh(): Promise<boolean> {
    const response = await request<ITokenPair>(urls.auth.refresh, {method: 'POST'})

    if (response && 'access_token' in response) {
        await setCookies(response)
        return true
    }
    return false
}