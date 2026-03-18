import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {decodeJwt} from "jose";
import {refreshSession} from "@/shared/api";
import {COOKIE_OPTIONS} from "@/shared/config";



export default async function proxy(request: NextRequest) {

    const {pathname} = request.nextUrl
    const token = request.cookies.get('access_token')?.value

    if (pathname.startsWith('/auth')) {
        return NextResponse.next();
    }

    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/crm', request.url))
        } else {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
    }

    if (token) {
        try {
            const payload = decodeJwt(token);
            if (payload.exp && Date.now() >= payload.exp * 1000 - 300000) {  // minus 300k for 5 minutes earlier
                const refreshToken = request.cookies.get('refresh_token')?.value

                if (refreshToken) {
                    const newTokens = await refreshSession(refreshToken)

                    if (newTokens) {
                        const response = NextResponse.next()

                        response.cookies.set('access_token', newTokens.access_token, COOKIE_OPTIONS)
                        response.cookies.set('refresh_token', newTokens.refresh_token, COOKIE_OPTIONS)

                        return response
                    }
                    const response = NextResponse.redirect(new URL('/auth', request.url))
                    response.cookies.delete('access_token')
                    response.cookies.delete('refresh_token')
                    return response
                }
                const response = NextResponse.redirect(new URL('/auth', request.url))
                response.cookies.delete('access_token')
                response.cookies.delete('refresh_token')
                return response
            }
        } catch (e) {
            console.error(e)
        }
        return NextResponse.next()
    }

    const response = NextResponse.redirect(new URL('/auth', request.url))
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public|.*\\..*).*)'],
}