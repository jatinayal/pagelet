/**
 * Database Connection Utility
 * ===========================
 * 
 * This file handles MongoDB connection using Mongoose.
 * Uses a cached connection in development to prevent
 * multiple connections during hot reloads.
 * 
 * Usage:
 *   import { connectDB } from '@/lib/db';
 *   await connectDB();
 */

import mongoose from 'mongoose';

/**
 * Global is used to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Caches the connection for reuse across hot reloads in development.
 * 
 * @returns {Promise<mongoose>} The mongoose connection
 * @throws {Error} If MONGODB_URI is not defined
 */
export async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local'
        );
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
