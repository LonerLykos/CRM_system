'use server'

import {logoutAction} from "@/features/logout/model/logoutAction";
import Form from "next/form";
import Image from "next/image";


export const LogoutButton = async() => {
    return (
        <Form action={logoutAction}>
            <button type="submit" style={{all: 'unset'}}>
                <Image src={'/icons/logout.png'} alt={'Logout'} width={30} height={30}/>
            </button>
        </Form>
    )
}