/**
 * Single Block API Routes
 * =======================
 * 
 * PATCH  /api/blocks/[blockId] - Update block (auto-save endpoint)
 * DELETE /api/blocks/[blockId] - Delete block
 * 
 * All routes require authentication and ownership validation.
 * 
 * Auto-save Design
 * ----------------
 * The PATCH endpoint is designed for frequent auto-save calls:
 * 
 * 1. **Partial Updates**: Only send changed fields (content, type, order)
 *    Example: { content: { text: "updated text" } }
 * 
 * 2. **Minimal Payload**: No need to send the entire block
 *    
 * 3. **Debounce on Frontend**: Client should debounce edits (~500ms)
 *    to reduce API calls while user is typing
 * 
 * 4. **No Response Body Needed**: For pure auto-save, client can
 *    ignore the response. We still return the updated block for
 *    cases where the client needs confirmation.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import Block from '@/models/Block';
import { withAuth } from '@/lib/withAuth';

/**
 * Helper to validate ObjectId format.
 */
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Helper to verify block ownership through its page.
 * Returns the block if owned, null otherwise.
 */
async function getOwnedBlock(blockId, userId) {
    const block = await Block.findById(blockId).lean();
    if (!block) return null;

    const page = await Page.findOne({
        _id: block.pageId,
        userId: userId,
    }).lean();

    return page ? block : null;
}

/**
 * PATCH /api/blocks/[blockId]
 * Updates block content, type, or order.
 * 
 * Body (all optional): {
 *   content?: object,
 *   type?: string,
 *   order?: number
 * }
 * 
 * Only provided fields are updated (partial update).
 */
async function updateBlock(request, { user, params }) {
    try {
        const { blockId } = await params;
        const body = await request.json();

        if (!isValidObjectId(blockId)) {
            return NextResponse.json(
                { error: 'Invalid block ID' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify ownership
        const existingBlock = await getOwnedBlock(blockId, user._id);
        if (!existingBlock) {
            return NextResponse.json(
                { error: 'Block not found' },
                { status: 404 }
            );
        }

        // Build update object with only provided fields
        const updateFields = {};
        if (body.content !== undefined) updateFields.content = body.content;
        if (body.type !== undefined) updateFields.type = body.type;
        if (body.order !== undefined) updateFields.order = body.order;
        if (body.backgroundColor !== undefined) updateFields.backgroundColor = body.backgroundColor;

        // Nothing to update
        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ block: existingBlock });
        }

        // Perform update
        const block = await Block.findByIdAndUpdate(
            blockId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        // Update parent page's updatedAt timestamp
        await Page.findByIdAndUpdate(
            existingBlock.pageId,
            { updatedAt: new Date() }
        );

        return NextResponse.json({ block: block.toJSON() });
    } catch (error) {
        console.error('Update block error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Failed to update block' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/blocks/[blockId]
 * Deletes a single block.
 * Does NOT reorder remaining blocks (client handles visual order).
 */
async function deleteBlock(request, { user, params }) {
    try {
        const { blockId } = await params;

        if (!isValidObjectId(blockId)) {
            return NextResponse.json(
                { error: 'Invalid block ID' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify ownership
        const existingBlock = await getOwnedBlock(blockId, user._id);
        if (!existingBlock) {
            return NextResponse.json(
                { error: 'Block not found' },
                { status: 404 }
            );
        }

        // Delete the block
        await Block.findByIdAndDelete(blockId);

        // Update parent page's updatedAt timestamp
        await Page.findByIdAndUpdate(
            existingBlock.pageId,
            { updatedAt: new Date() }
        );

        return NextResponse.json({
            message: 'Block deleted successfully',
        });
    } catch (error) {
        console.error('Delete block error:', error);
        return NextResponse.json(
            { error: 'Failed to delete block' },
            { status: 500 }
        );
    }
}

// Export wrapped handlers
export const PATCH = withAuth(updateBlock);
export const DELETE = withAuth(deleteBlock);
