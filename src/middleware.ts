import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    console.log("Triggering middleware")
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const pathname = request.nextUrl.pathname;

    // User has no tokens
    if (!accessToken || !refreshToken) {
        if (!pathname.startsWith('/auth')) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            request.cookies.clear();
            return NextResponse.redirect(url);
        }
        // Already on /auth, do nothing
        return NextResponse.next();
    }

    // User has tokens and is trying to access /auth pages
    if (pathname.startsWith('/auth')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // TODO: Handle token refresh if expired

    return NextResponse.next();
}



export const config = {
    matcher: ['/', '/auth/:path*'],
};