import {api, IPaginatedResponse, QueryParams} from "@/shared/api";
import {urls} from "@/shared/config";
import {IOrderResponse} from "@/entities/order";


export const orderService = {
    getAllOrders: <T>(params?: QueryParams) => api.get<IPaginatedResponse<IOrderResponse<T>>>(
        urls.crm.orders, params
    ),
    getOrderById: <T>(id: string) => api.get<IOrderResponse<T>>(urls.crm.byId(id))
}


