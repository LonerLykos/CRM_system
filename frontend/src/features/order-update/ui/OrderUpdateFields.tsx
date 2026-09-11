'use client'

import {useActionState} from "react";
import {ISearchParams} from "@/shared/model";
import {IChoicesResponse, IGroupResponse} from "@/entities/crm";
import {GroupSelect} from "@/features/crm-group-create";
import {SubmitButton} from "@/shared/ui";
import {orderUpdateAction} from "../model/orderUpdateAction";
import s from './OrderUpdateForm.module.sass';

interface OrderUpdateFieldsProps {
    params: ISearchParams
    /** Stored values of the order — the diff base for the PATCH. */
    original: Record<string, string | number>
    choices: IChoicesResponse
    groups: IGroupResponse[]
    defaultGroupName: string
}

export const OrderUpdateFields = ({
    params,
    original,
    choices,
    groups,
    defaultGroupName,
}: OrderUpdateFieldsProps) => {
    const [state, dispatch] = useActionState(orderUpdateAction, null)

    const initial = (key: string): string => state?.values[key] ?? String(original[key] ?? '')

    const groupId = initial('group')
    const groupName = state
        ? groups.find((g) => String(g.id) === groupId)?.name ?? ''
        : defaultGroupName

    return (
        <form key={state?.attempt ?? 0} action={dispatch}>
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
                        defaultValue={initial('name')}
                    />
                </div>

                <div className={s.field}>
                    <label htmlFor='ou-surname'>Surname</label>
                    <input
                        id='ou-surname'
                        name='surname'
                        type='text'
                        placeholder='Surname'
                        defaultValue={initial('surname')}
                    />
                </div>

                <div className={`${s.field} ${s.full_width}`}>
                    <label htmlFor='ou-email'>Email</label>
                    <input
                        id='ou-email'
                        name='email'
                        type='email'
                        placeholder='Email'
                        defaultValue={initial('email')}
                    />
                </div>

                <div className={s.field}>
                    <label htmlFor='ou-phone'>Phone</label>
                    <input
                        id='ou-phone'
                        name='phone'
                        type='tel'
                        placeholder='Phone'
                        defaultValue={initial('phone')}
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
                        defaultValue={initial('age')}
                    />
                </div>

                <div className={s.field}>
                    <label htmlFor='ou-course'>Course</label>
                    <select
                        id='ou-course'
                        name='course'
                        defaultValue={initial('course')}
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
                        defaultValue={initial('course_format')}
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
                        defaultValue={initial('course_type')}
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
                        defaultValue={initial('status')}
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
                        groups={groups}
                        defaultGroupId={groupId === '' ? '' : Number(groupId)}
                        defaultGroupName={groupName}
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
                        defaultValue={initial('sum')}
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
                        defaultValue={initial('already_paid')}
                    />
                </div>

                {state?.error && (
                    <p className={s.error} role='alert'>{state.error}</p>
                )}

                <SubmitButton
                    className={`${s.submit_btn} ${s.full_width}`}
                    pendingLabel='Updating…'
                >
                    Update
                </SubmitButton>
            </div>
        </form>
    )
}
