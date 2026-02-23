/**
 * Authentication Utilities
 * ========================
 * 
 * JWT-based authentication helpers for the NotionClone app.
 * 
 * JWT Flow:
 * 1. User logs in with email/password
 * 2. Server validates credentials against database
 * 3. Server creates a signed JWT containing user ID
 * 4. JWT is stored in an HTTP-only cookie (secure, not accessible via JS)
 * 5. On protected routes, middleware reads cookie, verifies JWT
 * 6. If valid, user data is attached to request for route handlers
 * 
 * Why HTTP-only cookies?
 * - Prevents XSS attacks from stealing tokens
 * - Automatically sent with requests (no client-side handling needed)
 * - Can set secure flags for HTTPS-only transmission
 */

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = 'token';

/**
 * Signs a JWT with the given payload.
 * 
 * @param {Object} payload - Data to encode (typically { userId })
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies and decodes a JWT.
 * 
 * @param {string} token - JWT to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        // Token is invalid or expired
        return null;
    }
}

/**
 * Sets the JWT token as an HTTP-only cookie.
 * Called after successful login/registration.
 * 
 * @param {string} token - JWT token to store
 */
export async function setTokenCookie(token) {
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
        path: '/',
    });
}

/**
 * Clears the JWT cookie.
 * Called on logout.
 */
export async function clearTokenCookie() {
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
    });
}

/**
 * Gets the JWT token from cookies.
 * 
 * @returns {string|null} Token or null if not found
 */
export async function getTokenFromCookies() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    return tokenCookie?.value || null;
}

/**
 * Extracts Bearer token from Authorization header.
 * Fallback for API clients that can't use cookies.
 * 
 * @param {Headers} headers - Request headers
 * @returns {string|null} Token or null if not found
 */
export function getTokenFromHeaders(headers) {
    const authHeader = headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}

/**
 * Gets and verifies the current user from the request.
 * Checks both cookies and Authorization header.
 * 
 * @param {Request} request - Next.js request object
 * @returns {Object|null} Decoded user payload or null
 */
export async function getCurrentUser(request) {
    // Try cookie first
    let token = await getTokenFromCookies();

    // Fallback to Authorization header
    if (!token && request) {
        token = getTokenFromHeaders(request.headers);
    }

    if (!token) {
        return null;
    }

    return verifyToken(token);
}
