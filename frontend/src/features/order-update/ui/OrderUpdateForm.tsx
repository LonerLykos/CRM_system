import {orderUpdateAction} from "@/features/order-update";
import Form from "next/form";
import {ISearchParams} from "@/shared/model";
import Link from "next/link";
import Image from "next/image";
import {rebuildParams} from "@/shared/libs";
import {getCachedChoices} from "@/entities/crm";
import {crmService} from "@/entities/crm";
import {IOrderDetailResponse} from "@/entities/order";
import {GroupSelect} from "@/features/crm-group-create";
import {SubmitButton} from "@/shared/ui";
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

    const original = {
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

                <Form action={orderUpdateAction}>
                    <input type='hidden' name='params' value={JSON.stringify(params)}/>
                    <input type='hidden' name='__original' value={JSON.stringify(original)}/>

                    <div className={s.fields}>
                        <div className={s.field}>
                            <label htmlFor='ou-name'>Name</label>
                            <input
                                id='ou-name'
                                name='name'
                                type='text'
                                placeholder='Name'
                                defaultValue={order?.name ?? ''}
                            />
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-surname'>Surname</label>
                            <input
                                id='ou-surname'
                                name='surname'
                                type='text'
                                placeholder='Surname'
                                defaultValue={order?.surname ?? ''}
                            />
                        </div>

                        <div className={`${s.field} ${s.full_width}`}>
                            <label htmlFor='ou-email'>Email</label>
                            <input
                                id='ou-email'
                                name='email'
                                type='email'
                                placeholder='Email'
                                defaultValue={order?.email ?? ''}
                            />
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-phone'>Phone</label>
                            <input
                                id='ou-phone'
                                name='phone'
                                type='tel'
                                placeholder='Phone'
                                defaultValue={order?.phone ?? ''}
                            />
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-age'>Age</label>
                            <input
                                id='ou-age'
                                name='age'
                                type='number'
                                placeholder='Age'
                                min={1}
                                max={100}
                                defaultValue={order?.age ?? ''}
                            />
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-course'>Course</label>
                            <select
                                id='ou-course'
                                name='course'
                                defaultValue={order?.course ?? ''}
                            >
                                <option value=''>— select —</option>
                                {Object.entries(choices.course).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-course_format'>Format</label>
                            <select
                                id='ou-course_format'
                                name='course_format'
                                defaultValue={order?.course_format ?? ''}
                            >
                                <option value=''>— select —</option>
                                {Object.entries(choices.course_format).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-course_type'>Type</label>
                            <select
                                id='ou-course_type'
                                name='course_type'
                                defaultValue={order?.course_type ?? ''}
                            >
                                <option value=''>— select —</option>
                                {Object.entries(choices.course_type).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-status'>Status</label>
                            <select
                                id='ou-status'
                                name='status'
                                defaultValue={order?.status ?? ''}
                            >
                                <option value=''>— select —</option>
                                {Object.entries(choices.status).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`${s.field} ${s.full_width}`}>
                            <label>Group</label>
                            <GroupSelect
                                groups={groups ?? []}
                                defaultGroupId={currentGroupId}
                                defaultGroupName={order?.group ?? ''}
                            />
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-sum'>Sum</label>
                            <input
                                id='ou-sum'
                                name='sum'
                                type='number'
                                placeholder='Sum'
                                min={0}
                                step='0.01'
                                defaultValue={order?.sum ?? ''}
                            />
                        </div>

                        <div className={s.field}>
                            <label htmlFor='ou-already_paid'>Already paid</label>
                            <input
                                id='ou-already_paid'
                                name='already_paid'
                                type='number'
                                placeholder='Already paid'
                                min={0}
                                step='0.01'
                                defaultValue={order?.already_paid ?? ''}
                            />
                        </div>

                        <SubmitButton
                            className={`${s.submit_btn} ${s.full_width}`}
                            pendingLabel='Updating…'
                        >
                            Update
                        </SubmitButton>
                    </div>
                </Form>
            </div>
        </div>
    )
}
