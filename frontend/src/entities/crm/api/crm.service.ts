import {urls} from "@/shared/config";
import {api, publicRequest} from "@/shared/api";
import {IChoicesResponse, IGroupResponse} from "@/entities/crm";


export const crmService = {
    getChoices: () => publicRequest<IChoicesResponse>(urls.crm.choices),
    getGroups: () => api.get<IGroupResponse[]>(urls.crm.groups),
    crateGroup: () => api.post(urls.crm.createGroup)
}


