'use server'

import {ICommentResponse} from "@/entities/comment";
import {orderService} from "@/entities/order";
import {OrderTable} from "@/widgets/OrderTable";
import {Pagination} from "@/shared/ui";

interface Props{
    page: number;
}

export const OrdersPage = async ({page}: Props) => {

    const {ok, result, error} = await orderService.getAllOrders<ICommentResponse>({page: page});
    if (!ok) {return <></>}

    return (
        <div className="page-wrapper">

            <OrderTable orders={result.data} />

            <Pagination
                currentPage={page}
                baseUrl="/crm"
                paginationInfo={result}
            />
        </div>
    );
}