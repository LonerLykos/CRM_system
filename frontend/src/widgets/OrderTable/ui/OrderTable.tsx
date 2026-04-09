'use server'

import React from "react";
import Link from "next/link";
import {columns, IOrderResponse, IOrderDetailResponse, orderingToggle, OrderRow} from "@/entities/order";
import {CommentDetail, ICommentResponse} from "@/entities/comment";
import {ISearchParams} from "@/shared/model";
import {rebuildParams} from "@/shared/libs";
import s from './OrderTable.module.sass';
import {CommentForm} from "@/features/comment-create";
import {OrderUpdateForm} from "@/features/order-update";

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

    const error = params.error
    const update_order = params.update_order

    return (
        <table className={s.ordersTable}>
            <thead>
            <tr>
                {columns.map(({key, label}) => (
                    <th key={key}>
                        <Link href={getSortHref(key)}>
                            {label}
                            <span className={s.arrow}>
                                {params.order?.includes(key) &&
                                    (params.order.startsWith('-') ? '\u2193' : '\u2191')}
                            </span>
                        </Link>
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {orders.map((order, index) => (
                <React.Fragment key={order.id}>
                    <OrderRow className={index % 2 === 0 ? s.rowEven : s.rowOdd} params={params} order={order}/>
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
                                            {currentOrder && currentOrder.comments.map(comment => (
                                                <CommentDetail key={comment.id} comment={comment}/>
                                            ))}
                                        </div>
                                        <div className={s.commentForm}>
                                            <CommentForm params={params}/>
                                            <p className={s.errorMsg}>{error && error}</p>
                                        </div>
                                    </div>

                                    {update_order
                                        ? <OrderUpdateForm params={params}/>
                                        : <Link href={
                                            `/crm?${rebuildParams(
                                                params,
                                                {update_order: String(order.id)}
                                            )}`
                                        }>EDIT</Link>}
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