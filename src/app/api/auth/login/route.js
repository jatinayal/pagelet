/**
 * Login API Route
 * ===============
 * 
 * POST /api/auth/login
 * 
 * Authenticates a user with:
 * - Email
 * - Password
 * 
 * On success:
 * - Verifies password against hash
 * - Signs a JWT token
 * - Sets HTTP-only cookie
 * - Returns user data (without password)
 * 
 * Errors:
 * - 400: Missing fields
 * - 401: Invalid credentials
 * - 500: Server error
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken, setTokenCookie } from '@/lib/auth';

export async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            // Use generic message to prevent email enumeration
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = signToken({ userId: user._id });

        // Set HTTP-only cookie
        await setTokenCookie(token);

        // Return user data (toJSON removes password automatically)
        return NextResponse.json({
            message: 'Login successful',
            user: user.toJSON(),
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
