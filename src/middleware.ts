import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/profile-completion'];

// Function to decode JWT without verification (since we're in Edge Runtime)
function decodeJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // Allow access to public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // If no token, redirect to login
    if (!token) {
        const redirectTo = encodeURIComponent(pathname);
        const loginUrl = `${request.nextUrl.origin}/login?redirectTo=${redirectTo}`;
        return NextResponse.redirect(loginUrl);
    }

    try {
        const decoded = decodeJwt(token);
        if (!decoded) {
            throw new Error('Invalid token');
        }
        const isAuthenticated = decoded.exp > Date.now() / 1000;
        const userRole = decoded.role;

        // If token is expired, redirect to login
        if (!isAuthenticated) {
            const redirectTo = encodeURIComponent(pathname);
            const loginUrl = `${request.nextUrl.origin}/login?redirectTo=${redirectTo}`;
            return NextResponse.redirect(loginUrl);
        }

        // Handle admin routes
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Handle artist routes
        if (pathname.startsWith('/artist') && userRole !== 'artist') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        // If there's any error with the token, redirect to login
        const redirectTo = encodeURIComponent(pathname);
        const loginUrl = `${request.nextUrl.origin}/login?redirectTo=${redirectTo}`;
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/artist/:path*',
    ],
};