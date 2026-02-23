/**
 * Next.js Middleware
 * ==================
 * 
 * This middleware runs before requests are completed.
 * Used for:
 * - Route protection (checking JWT for authenticated routes)
 * - Redirecting unauthenticated users to login
 * 
 * Protected routes: /dashboard, /page/*
 * Public routes: /, /login, /signup, /api/auth/*
 * 
 * Implementation will be added during authentication phase.
 */

import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/page'];

// Routes that authenticated users should not access (redirect to dashboard)
const authRoutes = ['/login', '/signup'];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // TODO: Implement JWT verification from cookies/headers
    // const token = request.cookies.get('token')?.value;
    // const isAuthenticated = token && verifyToken(token);

    // For now, allow all requests through
    return NextResponse.next();

    /*
     * Future implementation:
     * 
     * // Check if accessing protected route without auth
     * const isProtectedRoute = protectedRoutes.some(route => 
     *   pathname.startsWith(route)
     * );
     * 
     * if (isProtectedRoute && !isAuthenticated) {
     *   return NextResponse.redirect(new URL('/login', request.url));
     * }
     * 
     * // Check if authenticated user accessing auth routes
     * const isAuthRoute = authRoutes.some(route => 
     *   pathname.startsWith(route)
     * );
     * 
     * if (isAuthRoute && isAuthenticated) {
     *   return NextResponse.redirect(new URL('/dashboard', request.url));
     * }
     * 
     * return NextResponse.next();
     */
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)',
    ],
};
