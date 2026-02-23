/**
 * Authentication Middleware
 * =========================
 * 
 * Higher-order function that wraps API route handlers to require authentication.
 * 
 * Usage:
 *   import { withAuth } from '@/lib/withAuth';
 *   
 *   async function handler(request, { user }) {
 *     // user is the authenticated user object
 *     return Response.json({ message: `Hello ${user.name}` });
 *   }
 *   
 *   export const GET = withAuth(handler);
 * 
 * How it works:
 * 1. Extracts JWT from cookie or Authorization header
 * 2. Verifies the token
 * 3. Fetches user from database
 * 4. Passes user to the wrapped handler
 * 5. Returns 401 if any step fails
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

/**
 * Middleware that requires authentication for an API route.
 * 
 * @param {Function} handler - The route handler function
 * @returns {Function} Wrapped handler with auth check
 */
export function withAuth(handler) {
    return async (request, context) => {
        try {
            // Get user ID from JWT
            const payload = await getCurrentUser(request);

            if (!payload || !payload.userId) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            // Connect to database
            await connectDB();

            // Fetch user from database
            const user = await User.findById(payload.userId);

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 401 }
                );
            }

            // Add user to context and call the handler
            const extendedContext = {
                ...context,
                user: user.toJSON(),
            };

            return handler(request, extendedContext);
        } catch (error) {
            console.error('Auth middleware error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }
    };
}

export default withAuth;
