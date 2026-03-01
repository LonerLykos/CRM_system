import Link from "next/link";
import styles from "./Menu.module.sass"
import {UserAvatar} from "@/shared/ui/UserAvatar/UserAvatar";

const Menu = async () => {

    return (
        <div className={styles.mainMenu}>
            <nav className={styles.navigate}>
                <UserAvatar hash={'75d23af433e0cea4c0e45a56dba18b30'}/>
                <Link href="/cats">Cats</Link>
                <Link href="/missions">Missions</Link>
            </nav>
        </div>
    );
};

export default Menu;
