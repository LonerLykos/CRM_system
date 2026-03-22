'use server'

import {columns, IOrderResponse, IOrderDetailResponse, orderingToggle, OrderRow} from "@/entities/order";
import s from './OrderTable.module.sass';
import Link from "next/link";
import {ISearchParams} from "@/shared/model";
import {rebuildParams} from "@/shared/libs";
import React from "react";
import {CommentDetail, ICommentResponse} from "@/entities/comment";

interface OrderTableProps {
    orders: IOrderResponse[];
    activeOrderId: string;
    params: ISearchParams;
    currentOrder: IOrderDetailResponse<ICommentResponse> | null;
}


export const OrderTable = async ({
                                     orders,
                                     activeOrderId,
                                     params,
                                     currentOrder,
                                 }: OrderTableProps) => {

    const getSortHref = (field: string) => {
        const newOrder = orderingToggle(params.order || '', field);
        const query = rebuildParams(params, {order: newOrder, page: '1'});
        return `/crm?${query}`;
    };

    return (
        <table className={s.ordersTable}>
            <thead>
            <tr>
                {columns.map(({key, label}) => (
                    <th key={key}>
                        <Link href={getSortHref(key)}>
                            {label}
                            <span>
                                {params.order?.includes(key) &&
                                    (params.order.startsWith('-') ? '\u2193' : '\u2191')}
                            </span>
                        </Link>
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {orders.map(order => (
                <React.Fragment key={order.id}>
                    <OrderRow params={params} order={order}/>
                    {activeOrderId === String(order.id) && (
                        <tr className={s.expandedRow}>
                            <td colSpan={columns.length}>
                                <div className={s.detailsWrapper}>
                                    <div className={s.metaInfo}>
                                        <p>Message: {order.msg || 'null'}</p>
                                        <p>UTM: {order.utm || 'null'}</p>
                                    </div>

                                    <div className={s.commentsSection}>
                                        <div className={s.commentsList}>
                                            {currentOrder && currentOrder.comments.map((comment, index) => (
                                                <CommentDetail key={comment.id} comment={comment}/>
                                            ))}
                                        </div>
                                        <div className={s.commentForm}>
                                            <input type="text" placeholder="Comment"/>
                                            <button>SUBMIT</button>
                                        </div>
                                    </div>

                                    <button className={s.editBtn}>EDIT</button>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            ))}
            </tbody>
        </table>
    );
};