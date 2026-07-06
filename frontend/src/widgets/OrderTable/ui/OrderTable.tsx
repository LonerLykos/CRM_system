import React from "react";
import Link from "next/link";
import {columns, IOrderResponse, IOrderDetailResponse, orderingToggle, OrderRow} from "@/entities/order";
import {CommentDetail, ICommentResponse} from "@/entities/comment";
import {ISearchParams} from "@/shared/model";
import {rebuildParams} from "@/shared/libs";
import s from './OrderTable.module.sass';
import {CommentForm} from "@/features/comment-create";
import {OrderUpdateForm} from "@/features/order-update";
import {authService} from "@/entities/auth";

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

    // Current user — used only to mirror the backend ownership guard in the UI
    // (backend stays the real gate). The order carries the owner's `manager_id`
    // and getMe exposes the user `id`, so ownership is compared by id.
    const {result: me} = await authService.getMe()

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
            {orders.map((order, index) => {
                // Locked for this user when the order already has an owner
                // (manager) whose id isn't theirs — mirrors the backend ownership
                // guard so Edit / Add comment are visibly disabled instead of
                // failing. Compared by id (robust), not by surname.
                const locked = order.manager_id != null && order.manager_id !== me?.id

                return (
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
                                                <CommentForm params={params} disabled={locked}/>
                                                {locked && (
                                                    <p className={s.ownerMsg}>You are not owner of this order</p>
                                                )}
                                                <p className={s.errorMsg}>{error && error}</p>
                                            </div>
                                        </div>

                                        {update_order
                                            ? <OrderUpdateForm params={params} order={currentOrder}/>
                                            : locked
                                                ? <span
                                                    className={`${s.editLink} ${s.editLinkDisabled}`}
                                                    aria-disabled="true"
                                                    title="You are not owner of this order"
                                                >EDIT</span>
                                                : <Link
                                                    className={s.editLink}
                                                    href={
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
                )
            })}
            </tbody>
        </table>
    );
};