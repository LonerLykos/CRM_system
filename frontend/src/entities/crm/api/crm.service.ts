import {urls} from "@/shared/config";
import {api} from "@/shared/api";


export const crmService = {
    getChoices: () => api.get(urls.crm.choices),
    getGroups: () => api.get(urls.crm.groups),
    crateGroup: () => api.post(urls.crm.createGroup)
}


