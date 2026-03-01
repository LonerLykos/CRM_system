import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export default function proxy(request: NextRequest) {
    const targetPath = request.nextUrl.pathname.replace(/^\/api/, '');
    const targetUrl = new URL(targetPath, `${process.env.INTERNAL_API_URL}`);

    targetUrl.search = request.nextUrl.search;

    return NextResponse.rewrite(targetUrl);
}

export const config = {
    matcher: '/api/:path*',
}