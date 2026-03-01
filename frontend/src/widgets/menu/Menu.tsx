import Link from "next/link";
import styles from "./Menu.module.sass"

const Menu = async () => {

    return (
        <div className={styles.mainMenu}>
            <nav className={styles.navigate}>
                <Link href="/cats">Cats</Link>
                <Link href="/missions">Missions</Link>
            </nav>
        </div>
    );
};

export default Menu;
