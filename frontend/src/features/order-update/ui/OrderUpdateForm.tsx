import Link from "next/link";
import Image from "next/image";
import {ISearchParams} from "@/shared/model";
import {rebuildParams} from "@/shared/libs";
import {getCachedChoices} from "@/entities/crm";
import {crmService} from "@/entities/crm";
import {IOrderDetailResponse} from "@/entities/order";
import {OrderUpdateFields} from "./OrderUpdateFields";
import s from './OrderUpdateForm.module.sass';

interface OrderUpdateProps {
    params: ISearchParams
    order?: IOrderDetailResponse<unknown> | null
}

export const OrderUpdateForm = async ({params, order}: OrderUpdateProps) => {
    const choices = await getCachedChoices()
    const {result: groups} = await crmService.getGroups()

    const closeHref = `/crm?${rebuildParams(params, {update_order: ''})}`

    const currentGroupId = order?.group && groups
        ? groups.find((g) => g.name === order.group)?.id ?? ''
        : ''

    const original: Record<string, string | number> = {
        name: order?.name ?? '',
        surname: order?.surname ?? '',
        email: order?.email ?? '',
        phone: order?.phone ?? '',
        age: order?.age ?? '',
        course: order?.course ?? '',
        course_format: order?.course_format ?? '',
        course_type: order?.course_type ?? '',
        status: order?.status ?? '',
        group: currentGroupId,
        sum: order?.sum ?? '',
        already_paid: order?.already_paid ?? '',
    }

    return (
        <div className={s.overlay}>
            <div className={s.update_form}>
                <div className={s.header}>
                    <h3>Edit Order #{order?.id ?? ''}</h3>
                    <Link href={closeHref} className={s.close_btn}>
                        <Image src={'/icons/close.png'} alt={'close'} width={24} height={24}/>
                    </Link>
                </div>

                <OrderUpdateFields
                    params={params}
                    original={original}
                    choices={choices}
                    groups={groups ?? []}
                    defaultGroupName={order?.group ?? ''}
                />
            </div>
        </div>
    )
}
