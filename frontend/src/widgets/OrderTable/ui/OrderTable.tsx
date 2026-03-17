'use server'

import {OrderBase, OrderRow} from "@/entities/order";
import s from './OrderTable.module.sass';


export const OrderTable = async ({ orders }: { orders: OrderBase[] }) => {
    return (
        <table className={s.ordersTable}>
            <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Course</th>
                <th>Course format</th>
                <th>Course type</th>
                <th>Status</th>
                <th>Sum</th>
                <th>Already paid</th>
                <th>Group</th>
                <th>Created at</th>
                <th>Manager</th>
            </tr>
            </thead>
            <tbody>
            {orders.map(order => (
                <OrderRow key={order.id} {...order} />
            ))}
            </tbody>
        </table>
    );
};