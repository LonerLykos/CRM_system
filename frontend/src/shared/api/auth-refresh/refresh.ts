import {request} from "@/shared/api/base/request";
import {urls} from "@/shared/config/urls";
import {ITokenPair} from "@/shared/api/model/ITokenPair";


export async function refresh(): Promise <ITokenPair | null> {
    const response = await request<ITokenPair>(urls.auth.refresh, {method: 'POST'})

    if (response.ok && response.result) {
        return response.result
    }
    return null
}