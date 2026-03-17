import {OrdersPage} from "@/pages/OrdersPage";


export default async function Page({searchParams}: {searchParams: Promise<{page?: string}>}) {

    const {page} = await searchParams
    return <OrdersPage page={page ? Number(page) : 1}/>;
}