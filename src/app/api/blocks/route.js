/**
 * Blocks API Routes
 * =================
 * 
 * POST /api/blocks - Create a new block
 * 
 * Requires authentication.
 * Validates that the user owns the target page.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import Block from '@/models/Block';
import { withAuth } from '@/lib/withAuth';

/**
 * POST /api/blocks
 * Creates a new block in a page.
 * 
 * Body: {
 *   pageId: string (required),
 *   type?: string (default: 'paragraph'),
 *   content?: object (default: { text: '' }),
 *   order?: number (default: append at end)
 * }
 * 
 * Auto-save friendly:
 * - Minimal required fields (just pageId)
 * - Sensible defaults for everything else
 * - Order auto-calculated if not provided
 */
async function createBlock(request, { user }) {
    try {
        const body = await request.json();
        const { pageId, type, content, order } = body;

        // Validate required fields
        if (!pageId) {
            return NextResponse.json(
                { error: 'Page ID is required' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(pageId)) {
            return NextResponse.json(
                { error: 'Invalid page ID' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify user owns the page
        const page = await Page.findOne({
            _id: pageId,
            userId: user._id,
        }).lean();

        if (!page) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            );
        }

        // Calculate order if not provided (append at end)
        const blockOrder = order ?? await Block.getNextOrder(pageId);

        // Create block with defaults
        const block = await Block.create({
            pageId,
            type: type || 'paragraph',
            content: content || { text: '' },
            order: blockOrder,
        });

        // Update page's updatedAt timestamp
        await Page.findByIdAndUpdate(pageId, { updatedAt: new Date() });

        return NextResponse.json(
            { block: block.toJSON() },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create block error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Failed to create block' },
            { status: 500 }
        );
    }
}

export const POST = withAuth(createBlock);
