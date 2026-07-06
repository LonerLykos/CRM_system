import {SetPasswordPage} from "@/views/SetPasswordPage";


export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{token: string}>;
    searchParams: Promise<{error?: string}>;
}) {
    const {token} = await params
    const {error} = await searchParams

    return <SetPasswordPage token={token} error={error}/>;
}
