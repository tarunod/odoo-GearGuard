import { NextResponse, NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('gearguard_auth_cipher')?.value;

    // Protect the dashboard route
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            await decrypt(session);
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect from login/register if already authenticated
    if (['/login', '/register'].includes(request.nextUrl.pathname)) {
        if (session) {
            try {
                await decrypt(session);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } catch (e) {
                // Session invalid, allow visiting login/register
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
