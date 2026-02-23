/**
 * Page Visibility API
 * ===================
 * 
 * Toggles the public visibility of a page.
 * Protected route: owner only.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';

async function handler(request, { params, user }) {
    try {
        await dbConnect();
        const { pageId } = await Promise.resolve(params);
        // console.log(user)

        // Parse body
        const { isPublic } = await request.json();
        // console.log(pageId)

        if (typeof isPublic !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid payload: isPublic must be a boolean' },
                { status: 400 }
            );
        }

        // Find and update page, ensuring user owns it
        console.log(`[API] Toggling visibility for ${pageId} to ${isPublic}`);
        const page = await Page.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(pageId), userId: new mongoose.Types.ObjectId(user._id) },
            { $set: { isPublic } },
            { new: true, runValidators: true, strict: false }
        ).lean();


        if (!page) {
            return NextResponse.json(
                { error: 'Page not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: `Page is now ${isPublic ? 'public' : 'private'}`,
            isPublic: page.isPublic
        });

    } catch (error) {
        console.error('Page Visibility API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const PATCH = withAuth(handler);
