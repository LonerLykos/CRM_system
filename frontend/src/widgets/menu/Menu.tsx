'use server'

import {cookies} from "next/headers";
import Link from "next/link";
import styles from "./Menu.module.sass"
import {authService} from "@/entities/auth";
import {UserAvatar} from "@/shared/ui/UserAvatar/UserAvatar";

export const Menu = async () => {

    const cookiesStore = await cookies()
    const isCookies = cookiesStore.has('access_token')

    const user = isCookies ? await authService.getMe() : ''
    console.log(user)

    return (
        <div className={styles.mainMenu}>
            <nav className={styles.navigate}>
                <Link href="/auth">Login</Link>
                <Link href="/">Home</Link>
                {
                    user && 'avatar_hash' in user ? <UserAvatar hash={user.avatar_hash as string}/> : <></>
                }
            </nav>
        </div>
    );
};
