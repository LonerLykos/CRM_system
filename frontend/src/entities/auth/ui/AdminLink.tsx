'use server'

import Link from "next/link";
import Image from "next/image";
import {urls} from "@/shared/config";


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