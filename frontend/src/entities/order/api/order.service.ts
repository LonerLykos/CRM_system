import {api, IPaginatedResponse, QueryParams} from "@/shared/api";
import {urls} from "@/shared/config";
import {IOrderDetailResponse, IOrderRequest, IOrderResponse} from "@/entities/order";


export const orderService = {
    getAllOrders: (params?: QueryParams) => api.get<IPaginatedResponse<IOrderResponse>>(
        urls.crm.orders, params
    ),
    getOrderById: <T>(id: string) => api.get<IOrderDetailResponse<T>>(urls.crm.byId(id)),
    updateOrder: <T>(id: string, data: IOrderRequest) => api.post<IOrderDetailResponse<T>, IOrderRequest>(urls.crm.orderUpdate(id), data)
}


