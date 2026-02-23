/**
 * Current User API Route
 * ======================
 * 
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user's data.
 * 
 * Authentication:
 * - Reads JWT from HTTP-only cookie
 * - Falls back to Authorization header (for API clients)
 * 
 * On success:
 * - Returns user data (without password)
 * 
 * Errors:
 * - 401: Not authenticated or invalid token
 * - 404: User not found (token valid but user deleted)
 * - 500: Server error
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
    try {
        // Get user ID from JWT (cookie or header)
        const payload = await getCurrentUser(request);

        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Connect to database
        await connectDB();

        // Find user by ID
        const user = await User.findById(payload.userId);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return user data
        return NextResponse.json({
            user: user.toJSON(),
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user data' },
            { status: 500 }
        );
    }
}
