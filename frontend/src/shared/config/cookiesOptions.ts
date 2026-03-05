import {ResponseCookie} from "next/dist/compiled/@edge-runtime/cookies";

export const COOKIE_OPTIONS: Partial<ResponseCookie> = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
    }