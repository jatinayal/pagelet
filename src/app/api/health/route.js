/**
 * Health Check API Route
 * ======================
 * 
 * GET /api/health
 * 
 * Returns server status and optional database connection status.
 * Used for verifying the server is running and responsive.
 * 
 * Does NOT require authentication.
 */

import connectDB from '@/lib/db';

export async function GET() {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };

    // Check database connection (optional - won't throw)
    try {
        await connectDB();
        health.database = 'connected';
    } catch (error) {
        health.database = 'disconnected';
        health.databaseError = error.message;
    }

    return Response.json(health);
}
