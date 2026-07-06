import {urls} from "@/shared/config";
import {api, publicRequest} from "@/shared/api";
import {IChoicesResponse, IGroupResponse, ICreateGroupBody} from "@/entities/crm";


export const crmService = {
    getChoices: () => publicRequest<IChoicesResponse>(urls.crm.choices),
    getGroups: () => api.get<IGroupResponse[]>(urls.crm.groups),
    createGroup: (body: ICreateGroupBody) => api.post<IGroupResponse, ICreateGroupBody>(urls.crm.createGroup, body),
}


