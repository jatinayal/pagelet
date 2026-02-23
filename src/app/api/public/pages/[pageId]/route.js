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

        // Fetch blocks for the page
        let blocks = await Block.find({ pageId })
            .sort({ order: 1 })
            .lean();

        // Enrich 'page' blocks with actual titles
        const pageBlocks = blocks.filter(b => b.type === 'page' && b.content?.pageId);
        if (pageBlocks.length > 0) {
            const pageIds = pageBlocks.map(b => b.content.pageId);
            const pagesInfo = await Page.find({ _id: { $in: pageIds } }, 'title').lean();

            const titleMap = pagesInfo.reduce((acc, p) => {
                acc[p._id.toString()] = p.title;
                return acc;
            }, {});

            // Inject title into block content
            blocks = blocks.map(block => {
                if (block.type === 'page' && block.content?.pageId) {
                    return {
                        ...block,
                        content: {
                            ...block.content,
                            title: titleMap[block.content.pageId.toString()] || 'Untitled'
                        }
                    };
                }
                return block;
            });
        }

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
            blocks
        });

    } catch (error) {
        console.error('Public Page API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
