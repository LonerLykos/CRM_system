'use server'

import Link from "next/link";
import styles from "./Menu.module.sass"
import {AdminLink, authService, UserAvatar} from "@/entities/auth";
import {LogoutButton} from "@/features/logout/ui/LogoutButton";
import Image from "next/image";


export const Menu = async () => {

    const user = await authService.getMe()
    const isLogin = 'name' in user

    return (
        <div className={styles.mainMenu}>
            <nav className={styles.navigate}>
                <div>
                    {/*    <Image src={'/icons/BB.png'} alt={'Logo'} width={48} height={48}/>*/}
                    {
                        isLogin ? <UserAvatar hash={user.avatar_hash as string}/> : <></>
                    }
                </div>
                <div className={styles.navigateBox}>
                    {
                        isLogin ?
                            <Link href="/">
                                <Image src={'/icons/Work.png'} alt={'Work'} width={30} height={30}/>
                            </Link>
                            :
                            <></>
                    }
                    {
                        isLogin && user.is_staff ? <AdminLink/> : <></>
                    }
                    {
                        isLogin ? <LogoutButton/> : <></>
                    }
                </div>

            </nav>
        </div>
    );
};
