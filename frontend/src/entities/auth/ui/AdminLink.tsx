import Link from "next/link";
import Image from "next/image";
import {urls} from "@/shared/config";


export const AdminLink = async () => {

    return(
        <Link href={`${urls.admin.users}`}>
            <Image
                className="icon-invert-dark"
                src={'/icons/administrator.png'}
                alt={'administrator'}
                width={30}
                height={30}/>
        </Link>
    );
};