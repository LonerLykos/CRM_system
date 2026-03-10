'use server'

import Link from "next/link";
import {urls} from "@/shared/config/urls";
import Image from "next/image";


export const AdminLink = async () => {

    return(
        <Link href={`${urls.admin.users}`}>
            <Image
                src={'/icons/administrator.png'}
                alt={'administrator'}
                width={30}
                height={30}/>
        </Link>
    );
};