import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const decoded = token && jwt.decode(token);
    const pathname = request.nextUrl.pathname;

    const isAuthenticated = decoded && (decoded as any).exp > Date.now() / 1000;

    if (pathname.startsWith('/developer/') && !isAuthenticated) {
        const redirectTo = encodeURIComponent(pathname);
        const loginUrl = `${request.nextUrl.origin}/login?redirectTo=${redirectTo}`;
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/developer/:path*', '/home/:path*'],
};