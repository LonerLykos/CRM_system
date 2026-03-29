import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {importSPKI, jwtVerify} from "jose";
import {refreshSession} from "@/shared/api";
import {COOKIE_OPTIONS, DELETE_COOKIE_OPTIONS} from "@/shared/config";

type JoseKey = Awaited<ReturnType<typeof importSPKI>>;

let publicKeyPromise: Promise<JoseKey> | null = null;

const getPublicKey = async (): Promise<JoseKey> => {
    if (publicKeyPromise) return publicKeyPromise;

    publicKeyPromise = (async () => {
        const b64 = process.env.JWT_PUBLIC_KEY_B64!;
        const pem = atob(b64);
        return await importSPKI(pem, 'RS256');
    })();

    return publicKeyPromise;
};

const logout = (request: NextRequest) => {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.set('access_token', '', DELETE_COOKIE_OPTIONS);
    response.cookies.set('refresh_token', '', DELETE_COOKIE_OPTIONS);
    return response;
};

export default async function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl

    if (pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next()
    }

    if (pathname.startsWith('/auth')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('access_token')?.value

    if (pathname === '/') {
        return token
            ? NextResponse.redirect(new URL('/crm', request.url))
            : NextResponse.redirect(new URL('/auth', request.url))
    }

    if (!token) {
        return logout(request)
    }

    try {
        const publicKey = await getPublicKey();
        const {payload} = await jwtVerify(token, publicKey);

        if (payload.exp && Date.now() >= payload.exp * 1000 - 300000) {
            const refreshToken = request.cookies.get('refresh_token')?.value

            if (refreshToken) {
                const newTokens = await Promise.race([
                    refreshSession(refreshToken),
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
                ]).catch(() => null);

                if (newTokens) {
                    const response = NextResponse.next()
                    response.cookies.set('access_token', newTokens.access_token, COOKIE_OPTIONS)
                    response.cookies.set('refresh_token', newTokens.refresh_token, COOKIE_OPTIONS)
                    return response
                }
            }
            return logout(request)
        }
        return NextResponse.next()
    } catch (e) {
        return logout(request)
    }
}

export const config = {
    matcher: [
        '/((?!api|_next|static|public|favicon.ico|.*\\..*).*)',
    ],
}
