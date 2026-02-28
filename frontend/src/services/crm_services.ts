import {deleteData, getData, patchData, postData} from "@/services/api.services";

import {urls} from "@/config/urls";
import {IAPIResponse, ICatResponse} from "@/models/cats/cats-models/ICatData";
import {ICatCreateRequest} from "@/models/cats/cat-create/ICatCreateRequest";

export interface IUpdateCatSalary {
    salary: number;
}

export const catService = {
    getAllCats: (page: number) => getData<IAPIResponse>(`${urls.crm.baseCRM}?page=${page}`),

    getCatById: (id: string) => getData<ICatResponse>(urls.crm.byId(id)),

    getAllBreeds: () => getData<string[]>(urls.crm.breeds),

    createCat: (data: ICatCreateRequest) =>
        postData<ICatCreateRequest, ICatResponse>(urls.crm.baseCRM, data),

    updateCatSalary:(id: string, salary: number) =>
        patchData<IUpdateCatSalary, ICatResponse>(urls.crm.byId(id), {salary:salary}),

    deleteCat: (id: string) => deleteData(urls.crm.byId(id))
};


