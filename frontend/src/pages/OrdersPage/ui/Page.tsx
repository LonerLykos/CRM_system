'use server'

import {ICommentResponse} from "@/entities/comment";
import {orderService} from "@/entities/order";
import {OrderTable} from "@/widgets/OrderTable";
import {Pagination} from "@/shared/ui";
import {ISearchParams} from "@/shared/model";

interface OrderParamsProps {
    params: ISearchParams
}

export const OrdersPage = async ({params}: OrderParamsProps) => {

    const {page = '1', orderId, ...filters} = params

    const {ok: listOk, result: listData} = await orderService.getAllOrders({...params});
    if (!listOk) {return <></>}

    let activeOrderDetails = null;

    if (orderId) {
        const { ok: detailOk, result: detailData } = await orderService.getOrderById<ICommentResponse>(orderId);
        if (detailOk) {
            activeOrderDetails = detailData;
        }
    }

    return (
        <div>

            <OrderTable orders={listData.data} activeOrderId={orderId ? orderId : ''} params={params} currentOrder={activeOrderDetails}/>

            <Pagination
                currentPage={Number(page)}
                baseUrl="/crm"
                paginationInfo={listData}
                currentParams={params}
            />
        </div>
    );
}