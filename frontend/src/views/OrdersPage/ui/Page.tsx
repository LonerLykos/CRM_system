import {ICommentResponse} from "@/entities/comment";
import {orderService} from "@/entities/order";
import {OrderTable} from "@/widgets/OrderTable";
import {Pagination} from "@/shared/ui";
import {ISearchParams} from "@/shared/model";
import {OrderFilter} from "@/features/order-filter";
import {crmService, getCachedChoices} from "@/entities/crm";
import {getCurrentUser} from "@/entities/auth";

interface OrderParamsProps {
    params: ISearchParams
}

export const OrdersPage = async ({params}: OrderParamsProps) => {

    const {page = '1', orderId} = params

    // Independent of each other — fetched in one round instead of a waterfall.
    // getCurrentUser() only warms the per-render cache that OrderTable reads.
    const [listResponse, detailResponse, choices, groupsResponse] = await Promise.all([
        orderService.getAllOrders({...params}),
        orderId ? orderService.getOrderById<ICommentResponse>(orderId) : Promise.resolve(null),
        getCachedChoices(),
        crmService.getGroups(),
        getCurrentUser(),
    ]);

    const {ok: listOk, result: listData} = listResponse;
    const {ok: groupsOk, result: groupsData} = groupsResponse;
    const activeOrderDetails = detailResponse?.ok ? detailResponse.result : null;
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