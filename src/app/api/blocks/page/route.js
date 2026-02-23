/**
 * Page Block API
 * ==============
 * 
 * POST /api/blocks/page - Create a page block (nested page)
 * 
 * This endpoint:
 * 1. Creates a new child page (with parentPageId set)
 * 2. Creates a page block referencing that child page
 * 
 * Why a special endpoint?
 * - Creating a page block requires creating TWO documents atomically
 * - We need to ensure the child page has proper parentPageId
 * - This keeps the block creation logic clean
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import Block from '@/models/Block';
import { withAuth } from '@/lib/withAuth';

/**
 * POST /api/blocks/page
 * Creates a child page and a page block referencing it.
 * 
 * Body: { 
 *   parentPageId: ObjectId,  // The page where the block is being added
 *   afterBlockId?: ObjectId, // Insert after this block (optional)
 *   title?: string           // Initial title for child page
 * }
 * 
 * Returns: { block: Block, childPage: Page }
 */
async function createPageBlock(request, { user }) {
    try {
        const body = await request.json();
        const { parentPageId, afterBlockId, title } = body;

        if (!parentPageId) {
            return NextResponse.json(
                { error: 'Parent page ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify the parent page exists and belongs to user
        const parentPage = await Page.findOne({
            _id: parentPageId,
            userId: user._id,
        });

        if (!parentPage) {
            return NextResponse.json(
                { error: 'Parent page not found' },
                { status: 404 }
            );
        }

        // Create the child page
        // Important: Set parentPageId so it's excluded from sidebar
        const childPage = await Page.create({
            title: title || 'Untitled',
            userId: user._id,
            parentPageId: parentPageId,  // This marks it as a child page
        });

        // Calculate block order
        let order;
        if (afterBlockId && mongoose.Types.ObjectId.isValid(afterBlockId)) {
            const afterBlock = await Block.findById(afterBlockId);
            order = afterBlock ? afterBlock.order + 1 : await Block.getNextOrder(parentPageId);
        } else {
            order = await Block.getNextOrder(parentPageId);
        }

        // Create the page block referencing the child page
        const block = await Block.create({
            pageId: parentPageId,
            type: 'page',
            order,
            content: {
                pageId: childPage._id,
                title: childPage.title,
            },
        });

        // Update parent page timestamp
        await Page.findByIdAndUpdate(parentPageId, { updatedAt: new Date() });

        return NextResponse.json(
            {
                block: block.toJSON(),
                childPage: childPage.toJSON()
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create page block error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Failed to create page block' },
            { status: 500 }
        );
    }
}

export const POST = withAuth(createPageBlock);
