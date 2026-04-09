'use server'

import {orderUpdateAction} from "@/features/order-update";
import Form from "next/form";
import {ISearchParams} from "@/shared/model";
import Link from "next/link";
import Image from "next/image";
import {rebuildParams} from "@/shared/libs";
import s from './OrderUpdateForm.module.sass';

interface OrderUpdateProps {
    params: ISearchParams
}

export const OrderUpdateForm = async ({params}: OrderUpdateProps) => {
    return (
        <div className={s.update_form}>
            <div>
                <Link href={`/crm?${rebuildParams(
                    params,
                    {update_order: ''}
                )}`}>
                    <Image src={'/icons/close.png'} alt={'close_window'} width={30} height={30}/>
                </Link>
            </div>
            <Form action={orderUpdateAction}>
                <input type='hidden' name='params' value={JSON.stringify(params)}/>
                <div>
                    <input name='name' type='name' placeholder='name'/>
                </div>
                <div>
                    <input name='surname' type='surname' placeholder='surname'/>
                </div>
                <div>
                    <input name='email' type='email' placeholder='email'/>
                </div>
                <div>
                    <input name='phone' type='phone' placeholder='phone'/>
                </div>
                <div>
                    <input name='age' type='age' placeholder='age'/>
                </div>
                <div>
                    <input name='course' type='course' placeholder='course'/>
                </div>
                <div>
                    <input name='course_format' type='course_format' placeholder='course_format'/>
                </div>
                <div>
                    <input name='course_type' type='course_type' placeholder='course_type'/>
                </div>
                <div>
                    <input name='sum' type='sum' placeholder='sum'/>
                </div>
                <div>
                    <input name='already_paid' type='already_paid' placeholder='already_paid'/>
                </div>
                <div>
                    <input name='status' type='status' placeholder='status'/>
                </div>
                <div>
                    <input name='group' type='group' placeholder='group'/>
                </div>
                <button type='submit'>Update</button>
            </Form>
        </div>
    )
}
