'use server'

import {ICommentResponse} from "@/entities/comment";
import {orderService} from "@/entities/order";
import {OrderTable} from "@/widgets/OrderTable";
import {Pagination} from "@/shared/ui";
import {ISearchParams} from "@/shared/model";
import {OrderFilter} from "@/features/order-filter";
import {crmService, getCachedChoices} from "@/entities/crm";

interface OrderParamsProps {
    params: ISearchParams
}

export const OrdersPage = async ({params}: OrderParamsProps) => {

    const {page = '1', orderId} = params

    const {ok: listOk, result: listData} = await orderService.getAllOrders({...params});

    let activeOrderDetails = null;

    if (orderId) {
        const {ok: detailOk, result: detailData} = await orderService.getOrderById<ICommentResponse>(orderId);
        if (detailOk) {
            activeOrderDetails = detailData;
        }
    }

    const choices = await getCachedChoices()

    const {ok: groupsOk, result: groupsData} = await crmService.getGroups()
    if (!listOk || !groupsOk) {
        return(
            <div>
                Server Error
            </div>
        )
    }

    return (
        <div>
            <OrderFilter params={params} choices={choices} groups={groupsData}/>
            {listOk ?
                <div>
                    <OrderTable orders={listData.data} activeOrderId={orderId ? orderId : ''} params={params}
                                currentOrder={activeOrderDetails}/>

                    <Pagination
                        currentPage={Number(page)}
                        baseUrl="/crm"
                        paginationInfo={listData}
                        currentParams={params}
                    />
                </div> : <div>There is no any orders with this params</div>
            }
        </div>
    );
}