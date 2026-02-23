/**
 * Pages API Routes
 * ================
 * 
 * POST /api/pages - Create a new page
 * GET  /api/pages - Get all pages for current user
 * 
 * Both routes require authentication.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import { withAuth } from '@/lib/withAuth';

/**
 * POST /api/pages
 * Creates a new page for the authenticated user.
 * 
 * Body: { title?: string }
 * Returns: { page: Page }
 */
async function createPage(request, { user }) {
    try {
        const body = await request.json().catch(() => ({}));
        const { title } = body;

        await connectDB();

        const page = await Page.create({
            title: title || 'Untitled',
            userId: user._id,
        });

        return NextResponse.json(
            { page: page.toJSON() },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create page error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Failed to create page' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/pages
 * Returns all ROOT pages for the authenticated user.
 * Child pages (with parentPageId) are excluded from this list.
 * They should only be accessed through their parent page.
 * 
 * Returns: { pages: Page[] }
 */
async function getPages(request, { user }) {
    try {
        await connectDB();

        // Only fetch root pages (parentPageId is null)
        // Child pages are not shown in sidebar
        const pages = await Page.find({
            userId: user._id,
            parentPageId: null  // Exclude child pages
        })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({ pages });
    } catch (error) {
        console.error('Get pages error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pages' },
            { status: 500 }
        );
    }
}

// Export wrapped handlers
export const POST = withAuth(createPage);
export const GET = withAuth(getPages);
