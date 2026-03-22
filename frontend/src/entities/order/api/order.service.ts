import {api, IPaginatedResponse, QueryParams} from "@/shared/api";
import {urls} from "@/shared/config";
import {IOrderDetailResponse, IOrderResponse} from "@/entities/order";


export const orderService = {
    getAllOrders: (params?: QueryParams) => api.get<IPaginatedResponse<IOrderResponse>>(
        urls.crm.orders, params
    ),
    getOrderById: <T>(id: string) => api.get<IOrderDetailResponse<T>>(urls.crm.byId(id))
}


