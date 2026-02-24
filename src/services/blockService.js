import Block from '@/models/Block';
import Page from '@/models/Page';

/**
 * Shared service for fetching paginated blocks for a page.
 * Used by both authenticated and public APIs.
 *
 * @param {string} pageId - The ID of the page
 * @param {string|number} limitParam - The limit parameter (default 20)
 * @param {string|number} cursorParam - The cursor parameter (order of the last loaded block)
 * @param {boolean} isPublicView - Whether this is being fetched for a public view (affects cleanup logic)
 * @returns {Promise<{blocks: Array, nextCursor: number|null, hasMore: boolean}>}
 */
export async function getPaginatedBlocks(pageId, limitParam, cursorParam, isPublicView = false) {
    // Default limit to 20, allow 'all'
    const limit = limitParam === 'all' ? 0 : (parseInt(limitParam) || 20);

    let query = { pageId };
    if (cursorParam && !isNaN(Number(cursorParam))) {
        query.order = { $gt: Number(cursorParam) };
    }

    // Fetch blocks sorted by order for correct rendering
    let dbQuery = Block.find(query).sort({ order: 1 });
    if (limit > 0) {
        dbQuery = dbQuery.limit(limit + 1); // Fetch one extra to check hasMore
    }

    const fetchedBlocks = await dbQuery.lean();

    let hasMore = false;
    let blocks = fetchedBlocks;
    if (limit > 0 && fetchedBlocks.length > limit) {
        hasMore = true;
        blocks = fetchedBlocks.slice(0, limit);
    }

    const nextCursor = blocks.length > 0 ? blocks[blocks.length - 1].order : null;

    // DEFENSIVE CLEANUP & ENRICHMENT
    const pageBlockIds = blocks
        .filter((b) => b.type === 'page' && b.content?.pageId)
        .map((b) => b.content.pageId);

    if (pageBlockIds.length > 0) {
        // Check which referenced pages actually exist
        const queryCond = { _id: { $in: pageBlockIds } };

        // Find existing pages
        const existingPagesList = await Page.find(queryCond).select('_id title isPublic').lean();
        const existingPagesMap = new Map(existingPagesList.map(p => [p._id.toString(), p]));

        // Find orphan blocks (reference non-existent pages)
        const orphanBlocks = blocks.filter(
            (b) => b.type === 'page' &&
                b.content?.pageId &&
                !existingPagesMap.has(b.content.pageId.toString())
        );

        // Delete orphan blocks from database (ONLY IF NOT PUBLIC VIEW)
        // Public view shouldn't modify DB to prevent tampering
        if (!isPublicView && orphanBlocks.length > 0) {
            await Block.deleteMany({
                _id: { $in: orphanBlocks.map((b) => b._id) },
            });
        }

        // Filter them out of response
        let finalBlocks = blocks.filter(
            (b) => b.type !== 'page' ||
                !b.content?.pageId ||
                existingPagesMap.has(b.content.pageId.toString())
        );

        // If public view, additionally filter out pages that are not public
        if (isPublicView) {
            finalBlocks = finalBlocks.filter(
                (b) => b.type !== 'page' ||
                    !b.content?.pageId ||
                    (existingPagesMap.has(b.content.pageId.toString()) && existingPagesMap.get(b.content.pageId.toString()).isPublic)
            );
        }

        // Inject titles
        finalBlocks = finalBlocks.map(block => {
            if (block.type === 'page' && block.content?.pageId) {
                const pageInfo = existingPagesMap.get(block.content.pageId.toString());
                return {
                    ...block,
                    content: {
                        ...block.content,
                        title: pageInfo?.title || 'Untitled'
                    }
                };
            }
            return block;
        });

        return { blocks: finalBlocks, nextCursor, hasMore };
    }

    return { blocks, nextCursor, hasMore };
}
