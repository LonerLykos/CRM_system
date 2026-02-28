import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export function proxy(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api')) {

        const targetPath = request.nextUrl.pathname.replace(/^\/api/, '');
        const targetUrl = new URL(targetPath, `${process.env.API_URL}`);

        targetUrl.search = request.nextUrl.search;

        return NextResponse.rewrite(targetUrl);
    }
}

export const config = {
    matcher: '/api/:path*',
}