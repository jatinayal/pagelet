
/**
 * Bulk Blocks API Route
 * =====================
 * 
 * PUT /api/pages/[pageId]/blocks - Replace/Sync all blocks for a page
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
 * PUT /api/pages/[pageId]/blocks
 * Syncs the entire block state for a page.
 * 
 * Body: {
 *   blocks: [{ _id, type, content, order, ... }]
 * }
 * 
 * Strategy:
 * 1. Identify blocks to UPDATE (have _id present in DB)
 * 2. Identify blocks to CREATE (no _id or _id not in DB - though usually client sends _id for optimistic UI)
 *    - Actually, client usually sends temp _ids or real _ids if they were already saved.
 *    - To simplify: We trust the client's snapshot of "current state".
 * 
 * Efficient "Sync" Strategy using bulkWrite:
 * - We receive the FULL list of blocks as they should exist.
 * - We find all existing blocks for this page.
 * - Any block in DB but NOT in request -> DELETE
 * - Any block in request -> upsert (Update if exists, Insert if not)
 */
async function syncPageBlocks(request, { user, params }) {
    try {
        const { pageId } = await params;
        const body = await request.json();
        const { blocks = [] } = body;

        if (!pageId || !mongoose.Types.ObjectId.isValid(pageId)) {
            return NextResponse.json({ error: 'Invalid page ID' }, { status: 400 });
        }

        await connectDB();

        // Verify user owns the page
        const page = await Page.findOne({ _id: pageId, userId: user._id });
        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        // Prepare bulk operations
        const operations = [];
        const incomingBlockIds = new Set();

        blocks.forEach((block, index) => {
            // Ensure order is correct based on array index
            const blockData = {
                pageId,
                type: block.type,
                content: block.content,
                order: index, // Enforce order by array position
                // Start generic metadata updates (like backgroundColor)
                backgroundColor: block.backgroundColor,
            };

            if (block._id && mongoose.Types.ObjectId.isValid(block._id)) {
                incomingBlockIds.add(block._id);
                operations.push({
                    updateOne: {
                        filter: { _id: block._id },
                        update: { $set: blockData },
                        upsert: true // If valid ObjectId but not found (rare), create it
                    }
                });
            } else {
                // New block: Generate ID explicitly so we can exclude it from deleteMany
                const newId = new mongoose.Types.ObjectId();
                blockData._id = newId;

                operations.push({
                    insertOne: {
                        document: blockData
                    }
                });

                // Add to incoming IDs so the subsequent deleteMany doesn't remove this new block
                incomingBlockIds.add(newId);
            }
        });

        // Delete blocks that are in DB but not in the incoming list (or just added)
        if (incomingBlockIds.size > 0) {
            operations.push({
                deleteMany: {
                    filter: {
                        pageId: pageId,
                        _id: { $nin: Array.from(incomingBlockIds) }
                    }
                }
            });
        } else {
            // This case should theoretically be unreachable if we create at least one block,
            // but effectively deletes all if list is empty.
            operations.push({
                deleteMany: {
                    filter: { pageId: pageId }
                }
            });
        }

        if (operations.length > 0) {
            await Block.bulkWrite(operations);
        }

        // Update page timestamp
        await Page.findByIdAndUpdate(pageId, { updatedAt: new Date() });

        // Return the fresh state
        const updatedBlocks = await Block.find({ pageId }).sort({ order: 1 }).lean();

        return NextResponse.json({ blocks: updatedBlocks });

    } catch (error) {
        console.error('Sync blocks error:', error);
        return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 });
    }
}

export const PUT = withAuth(syncPageBlocks);
