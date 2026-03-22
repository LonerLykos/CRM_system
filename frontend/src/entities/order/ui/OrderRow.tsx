'use server'

import {OrderBase} from "@/entities/order";
import Link from "next/link";
import {ISearchParams} from "@/shared/model";
import {formatDate, rebuildParams} from "@/shared/libs";


interface OrderRowProps {
    params: ISearchParams;
    order: OrderBase;
}

export const OrderRow = async({params, order}: OrderRowProps) => {
    const nextParams = rebuildParams(params, {orderId: `${order.id}`})
    return (
      <tr>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.id}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.name}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.surname}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.email}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.phone}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.age}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.course}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.course_format}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.course_type}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.status}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.sum}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.already_paid}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.group}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{formatDate(order.created_at)}</Link>
          </td>
          <td>
              <Link href={`/crm?${nextParams}`}>{order.manager}</Link>
          </td>
      </tr>
    );
} 