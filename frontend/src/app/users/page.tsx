import {UsersPage} from "@/views/UsersPage";

export default async function Page({searchParams}: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    return <UsersPage params={params}/>;
}
