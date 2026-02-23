/**
 * Register API Route
 * ==================
 * 
 * POST /api/auth/register
 * 
 * Creates a new user account with:
 * - Name
 * - Email (must be unique)
 * - Password (hashed before storage)
 * 
 * On success:
 * - Creates user in database
 * - Signs a JWT token
 * - Sets HTTP-only cookie
 * - Returns user data (without password)
 * 
 * Errors:
 * - 400: Missing fields or invalid data
 * - 409: Email already exists
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
        const { name, email, password } = body;

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already registered' },
                { status: 409 }
            );
        }

        // Create new user (password is hashed by pre-save hook)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
        });

        // Generate JWT token
        const token = signToken({ userId: user._id });

        // Set HTTP-only cookie
        await setTokenCookie(token);

        // Return user data (toJSON removes password automatically)
        return NextResponse.json(
            {
                message: 'Registration successful',
                user: user.toJSON(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json(
                { error: messages.join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
