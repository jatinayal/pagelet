/**
 * Public Page API
 * ===============
 * 
 * Fetches a page by ID if and only if it is marked as public.
 * No authentication required.
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Page from '@/models/Page';
import Block from '@/models/Block';
import { getPaginatedBlocks } from '@/services/blockService';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        // params is a promise in Next.js 15+ (or can be treated as such for safety)
        const { pageId } = await Promise.resolve(params);

        const page = await Page.findById(pageId).lean();
        console.log(`[API] Fetching public page ${pageId}. Found: ${!!page}, isPublic: ${page?.isPublic}`);

        if (!page) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            );
        }

        // Access Control: Public pages only
        if (!page.isPublic) {
            return NextResponse.json(
                { error: 'Access denied. This page is not public.' },
                { status: 403 }
            );
        }

        const url = new URL(request.url);
        const limitParam = url.searchParams.get('limit');
        const cursorParam = url.searchParams.get('cursor');

        // Fetch paginated blocks using shared service
        // isPublicView = true ensures we don't delete orphans and filters non-public pages
        const { blocks, nextCursor, hasMore } = await getPaginatedBlocks(
            pageId,
            limitParam,
            cursorParam,
            true
        );

        // Security: Remove internal/sensitive fields
        const sanitizedPage = {
            _id: page._id,
            title: page.title,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
            parentPageId: page.parentPageId,
            isPublic: page.isPublic
        };

        return NextResponse.json({
            page: sanitizedPage,
            blocks,
            nextCursor,
            hasMore
        });

    } catch (error) {
        console.error('Public Page API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
