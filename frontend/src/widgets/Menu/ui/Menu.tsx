import Link from "next/link";
import styles from "./Menu.module.sass"
import {AdminLink, authService, UserAvatar} from "@/entities/auth";
import {LogoutButton} from "@/features/auth-logout";
import {ThemeToggle} from "@/features/theme-toggle";
import Image from "next/image";


export const Menu = async () => {

    const {ok, status, result, error} = await authService.getMe()
    if (!ok) {
        return status === 500 ? (<div>Server Error</div>) : <></>
    }

    return (
        <div className={styles.mainMenu}>
            <nav className={styles.navigate}>
                <div className={styles.logoBlock}>
                    <Image src={'/icons/BB.png'} alt={'Logo'} width={40} height={40}/>
                </div>
                <div className={styles.userBlock}>
                    <UserAvatar hash={result.avatar_hash as string}/>
                    <span className={styles.userName}>
                        {result.name} {result.surname}
                    </span>
                </div>
                <div className={styles.navigateBox}>
                    <ThemeToggle/>
                    <Link href="/crm">
                        <Image className="icon-invert-dark" src={'/icons/Work.png'} alt={'Work'} width={30} height={30}/>
                    </Link>
                    {result.is_staff ? <AdminLink/> : <></>}
                    <LogoutButton/>
                </div>
            </nav>
        </div>
    );
};
