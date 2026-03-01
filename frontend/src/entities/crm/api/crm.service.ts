import {getData} from "@/shared/api/base/api.services";
import {urls} from "@/shared/config/urls";


export interface IUpdateCatSalary {
    salary: number;
}

export const crmService = {
    getAllOrders: (page: number) => getData<any>(`${urls.crm.orders}?page=${page}`),

};


