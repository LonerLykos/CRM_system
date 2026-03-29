import {ResponseCookie} from "next/dist/compiled/@edge-runtime/cookies";

export const COOKIE_OPTIONS: Partial<ResponseCookie> = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
}

export const DELETE_COOKIE_OPTIONS: Partial<ResponseCookie> = {
    domain: 'localhost',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
}