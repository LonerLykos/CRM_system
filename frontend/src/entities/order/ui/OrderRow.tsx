'use server'

import {formatDate, OrderBase} from "@/entities/order";


export const OrderRow = async(order: OrderBase) => {
    return (
      <tr>
          <td>{order.id}</td>
          <td>{order.name}</td>
          <td>{order.surname}</td>
          <td>{order.email}</td>
          <td>{order.phone}</td>
          <td>{order.age}</td>
          <td>{order.course}</td>
          <td>{order.course_format}</td>
          <td>{order.course_type}</td>
          <td>{order.status}</td>
          <td>{order.sum}</td>
          <td>{order.already_paid}</td>
          <td>{order.group}</td>
          <td>{formatDate(order.created_at)}</td>
          <td>{order.manager}</td>
      </tr>
    );
} 