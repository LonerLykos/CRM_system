import {NextRequest, NextResponse} from "next/server";

export const logoutAndRedirect = (request: NextRequest) => {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
};