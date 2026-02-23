/**
 * Logout API Route
 * ================
 * 
 * POST /api/auth/logout
 * 
 * Logs out the current user by:
 * - Clearing the JWT cookie
 * 
 * This is a simple operation that just removes the token.
 * The token itself remains valid until expiration, but without
 * the cookie, the client can't use it.
 * 
 * For stricter security (token revocation), you would need to:
 * - Store a token blacklist in Redis/DB
 * - Check blacklist on every request
 * (Not implemented in MVP for simplicity)
 */

import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';

export async function POST() {
    try {
        // Clear the JWT cookie
        await clearTokenCookie();

        return NextResponse.json({
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed. Please try again.' },
            { status: 500 }
        );
    }
}
