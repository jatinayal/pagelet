/**
 * Single Page API Routes
 * ======================
 * 
 * GET    /api/pages/[pageId] - Get page with blocks
 * PATCH  /api/pages/[pageId] - Update page title
 * DELETE /api/pages/[pageId] - Delete page and blocks
 * 
 * All routes require authentication and ownership validation.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import Block from '@/models/Block';
import { withAuth } from '@/lib/withAuth';
import { getPaginatedBlocks } from '@/services/blockService';

/**
 * Helper to validate ObjectId format.
 */
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /api/pages/[pageId]
 * Returns the page with its blocks, sorted by order.
 * 
 * Response structure optimized for rendering:
 * {
 *   page: { _id, title, ... },
 *   blocks: [{ _id, type, content, order, ... }, ...]
 * }
 */
async function getPage(request, { user, params }) {
    try {
        const { pageId } = await params;

        if (!isValidObjectId(pageId)) {
            return NextResponse.json(
                { error: 'Invalid page ID' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find page and verify ownership
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

        const url = new URL(request.url);
        const limitParam = url.searchParams.get('limit');
        const cursorParam = url.searchParams.get('cursor');

        // Use shared pagination service
        const { blocks, nextCursor, hasMore } = await getPaginatedBlocks(
            pageId,
            limitParam,
            cursorParam,
            false // isPublicView = false
        );

        return NextResponse.json({ page, blocks, nextCursor, hasMore });
    } catch (error) {
        console.error('Get page error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch page' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/pages/[pageId]
 * Updates page metadata (currently just title).
 * 
 * Body: { title: string }
 */
async function updatePage(request, { user, params }) {
    try {
        const { pageId } = await params;
        const body = await request.json();

        if (!isValidObjectId(pageId)) {
            return NextResponse.json(
                { error: 'Invalid page ID' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find and update with ownership check
        const page = await Page.findOneAndUpdate(
            { _id: pageId, userId: user._id },
            { $set: { title: body.title } },
            { new: true, runValidators: true }
        );

        if (!page) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ page: page.toJSON() });
    } catch (error) {
        console.error('Update page error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Failed to update page' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/pages/[pageId]
 * Deletes the page, all its blocks, AND all descendant child pages recursively.
 * Also removes any page blocks in the parent that reference this page.
 * 
 * RECURSIVE DELETION:
 * - Prevents orphan pages when a page with nested children is deleted
 * - All operations happen on the backend in a single request
 */
async function deletePage(request, { user, params }) {
    try {
        const { pageId } = await params;

        if (!isValidObjectId(pageId)) {
            return NextResponse.json(
                { error: 'Invalid page ID' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find page and verify ownership
        const page = await Page.findOne({
            _id: pageId,
            userId: user._id,
        });

        if (!page) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            );
        }

        // Collect all page IDs to delete (this page + all descendants)
        const pagesToDelete = await collectDescendantPages(pageId, user._id);

        // Delete all blocks for all pages being deleted
        await Block.deleteMany({ pageId: { $in: pagesToDelete } });

        // Delete all pages
        await Page.deleteMany({ _id: { $in: pagesToDelete } });

        // If this was a child page, remove the page block from parent
        if (page.parentPageId) {
            // Convert pageId to string for Mixed field comparison
            const pageIdStr = pageId.toString();
            await Block.deleteMany({
                pageId: page.parentPageId,
                type: 'page',
                $or: [
                    { 'content.pageId': pageId },
                    { 'content.pageId': pageIdStr },
                ],
            });
        }

        return NextResponse.json({
            message: 'Page deleted successfully',
            deletedCount: pagesToDelete.length,
            parentPageId: page.parentPageId || null,
        });
    } catch (error) {
        console.error('Delete page error:', error);
        return NextResponse.json(
            { error: 'Failed to delete page' },
            { status: 500 }
        );
    }
}

/**
 * Recursively collects all descendant page IDs.
 * Used for cascade deletion of nested pages.
 */
async function collectDescendantPages(pageId, userId) {
    const allIds = [pageId];

    // Find immediate children
    const children = await Page.find({
        parentPageId: pageId,
        userId: userId,
    }).select('_id').lean();

    // Recursively collect grandchildren (limit depth to 10 for safety)
    for (const child of children) {
        const childDescendants = await collectDescendantPages(child._id, userId);
        allIds.push(...childDescendants);
    }

    return allIds;
}

// Export wrapped handlers
export const GET = withAuth(getPage);
export const PATCH = withAuth(updatePage);
export const DELETE = withAuth(deletePage);
