import {OrdersPage} from "@/pages/OrdersPage";
import {ISearchParams} from "@/shared/model";



export default async function Page({searchParams}: { searchParams: Promise<ISearchParams> }) {
    const params = await searchParams
    return <OrdersPage params={params}/>;
}