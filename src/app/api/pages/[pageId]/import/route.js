/**
 * Import Blocks API
 * =================
 * 
 * POST /api/pages/[pageId]/import
 * 
 * Imports up to 50 blocks from a public page into the current authenticated user's page.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import Block from '@/models/Block';
import { withAuth } from '@/lib/withAuth';

async function importBlocks(request, { user, params }) {
    try {
        const { pageId: targetPageId } = await params;
        const body = await request.json();
        const { sourcePageId } = body;

        // Validation
        if (!targetPageId || !mongoose.Types.ObjectId.isValid(targetPageId)) {
            return NextResponse.json({ error: 'Invalid target page ID' }, { status: 400 });
        }
        if (!sourcePageId || !mongoose.Types.ObjectId.isValid(sourcePageId)) {
            return NextResponse.json({ error: 'Invalid source page ID' }, { status: 400 });
        }
        if (targetPageId === sourcePageId) {
            return NextResponse.json({ error: 'Cannot import from the same page' }, { status: 400 });
        }

        await connectDB();

        // Verify target page belongs to user
        const targetPage = await Page.findOne({ _id: targetPageId, userId: user._id });
        if (!targetPage) {
            return NextResponse.json({ error: 'Target page not found or unauthorized' }, { status: 404 });
        }

        // Verify source page is public
        const sourcePage = await Page.findById(sourcePageId).lean();
        if (!sourcePage) {
            return NextResponse.json({ error: 'Source page not found' }, { status: 404 });
        }
        if (!sourcePage.isPublic) {
            return NextResponse.json({ error: 'Source page is not public' }, { status: 403 });
        }

        // Fetch source blocks (max 50, excluding child pages)
        const sourceBlocks = await Block.find({ pageId: sourcePageId, type: { $ne: 'page' } })
            .sort({ order: 1 })
            .limit(50)
            .lean();

        if (sourceBlocks.length === 0) {
            return NextResponse.json({ error: 'Source page has no blocks' }, { status: 400 });
        }

        // Fetch target blocks to determine highest order
        const targetBlocksLast = await Block.find({ pageId: targetPageId })
            .sort({ order: -1 })
            .limit(1)
            .lean();

        let currentHighestOrder = targetBlocksLast.length > 0 ? targetBlocksLast[0].order : -1;

        // Prepare bulk insert for cloned blocks
        const clonedBlocks = sourceBlocks.map((block) => {
            currentHighestOrder++;
            return {
                pageId: targetPageId,
                type: block.type,
                content: block.content,
                order: currentHighestOrder,
                backgroundColor: block.backgroundColor, // Preserve background styling
                // We omit _id, createdAt, updatedAt as Mongoose handles them
            };
        });

        // Execute bulk insert
        let newlyInsertedBlocks = [];
        if (clonedBlocks.length > 0) {
            const result = await Block.insertMany(clonedBlocks);
            newlyInsertedBlocks = result.map(doc => doc.toObject());
        }

        // Update target page title if it is "Untitled" or empty
        let updatedTitle = null;
        if (!targetPage.title || targetPage.title.trim() === 'Untitled' || targetPage.title.trim() === '') {
            const newTitle = sourcePage.title || 'Imported Page';
            await Page.updateOne({ _id: targetPageId }, { $set: { title: newTitle } });
            updatedTitle = newTitle;
        }

        // Update page timestamp
        await Page.findByIdAndUpdate(targetPageId, { updatedAt: new Date() });

        // Enrich the return blocks similarly to standard getter (for page blocks titles)
        // If there are 'page' type blocks in the imported batch, their linked pages
        // might not be accessible if they aren't public, but we clone them anyway.
        // We'll just return the raw inserts and let the frontend refetch or handle it
        // cleanly without deep DB enrichment for speed, since we are returning the immediate append.

        return NextResponse.json({
            success: true,
            importedCount: clonedBlocks.length,
            blocks: newlyInsertedBlocks,
            updatedTitle
        });

    } catch (error) {
        console.error('Import blocks error:', error);
        return NextResponse.json({ error: 'Failed to import blocks' }, { status: 500 });
    }
}

export const POST = withAuth(importBlocks);
