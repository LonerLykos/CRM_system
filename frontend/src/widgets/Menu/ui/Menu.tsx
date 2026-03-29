'use server'

import Link from "next/link";
import styles from "./Menu.module.sass"
import {AdminLink, authService, UserAvatar} from "@/entities/auth";
import {LogoutButton} from "@/features/auth-logout";
import Image from "next/image";


export const Menu = async () => {

    const {ok, status, result, error} = await authService.getMe()
    if (!ok) {
        return status === 500 ? (<div>Server Error</div>) : <></>
    }

    return (
        <div className={styles.mainMenu}>
            <nav className={styles.navigate}>
                <div>
                    {/*    <Image src={'/icons/BB.png'} alt={'Logo'} width={48} height={48}/>*/}
                    <UserAvatar hash={result.avatar_hash as string}/>
                </div>
                <div className={styles.navigateBox}>
                    <Link href="/crm">
                        <Image src={'/icons/Work.png'} alt={'Work'} width={30} height={30}/>
                    </Link>
                    {
                        result.is_staff ? <AdminLink/> : <></>
                    }
                    <LogoutButton/>
                </div>

            </nav>
        </div>
    );
};
