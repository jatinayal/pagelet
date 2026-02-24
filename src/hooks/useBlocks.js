/**
 * useBlocks Hook
 * ==============
 * 
 * Manages block state for the page editor with auto-save functionality.
 * 
 * TipTap Integration Design
 * -------------------------
 * This hook is designed to be editor-agnostic:
 * 
 * 1. Block state is stored as objects with { content, type, order }
 * 2. The hook doesn't know HOW blocks are rendered - that's BlockRenderer's job
 * 3. updateBlockContent() accepts any content object
 * 4. When TipTap is added, content can be TipTap JSON instead of { text: string }
 * 
 * The backend stores content as Mixed type, so it accepts any structure.
 * This means swapping textarea for TipTap requires NO backend changes.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import * as api from '@/lib/apiClient';

export function useBlocks(pageId) {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Track if there are unsaved changes
    const [isDirty, setIsDirty] = useState(false);

    // Pagination state
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [isFetchingNext, setIsFetchingNext] = useState(false);

    /**
     * Load initial blocks for the page.
     */
    const loadBlocks = useCallback(async () => {
        if (!pageId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await api.getPage(pageId, 20, null);
            setBlocks(data.blocks || []);
            setHasMore(data.hasMore || false);
            setNextCursor(data.nextCursor || null);
            setIsDirty(false); // Reset dirty state on load
        } catch (err) {
            setError(err.message);
            console.error('Failed to load blocks:', err);
        } finally {
            setLoading(false);
        }
    }, [pageId]);

    // Load blocks on mount
    useEffect(() => {
        loadBlocks();
    }, [loadBlocks]);

    /**
     * Load next segment of blocks.
     */
    const loadMoreBlocks = useCallback(async () => {
        if (!hasMore || isFetchingNext || !nextCursor) return;

        try {
            setIsFetchingNext(true);
            const data = await api.getPage(pageId, 20, nextCursor);

            setBlocks((prev) => {
                const existingIds = new Set(prev.map(b => b._id));
                const newBlocks = (data.blocks || []).filter(b => !existingIds.has(b._id));
                return [...prev, ...newBlocks];
            });

            setHasMore(data.hasMore || false);
            setNextCursor(data.nextCursor || null);
        } catch (err) {
            console.error('Failed to load more blocks:', err);
        } finally {
            setIsFetchingNext(false);
        }
    }, [pageId, hasMore, isFetchingNext, nextCursor]);

    /**
     * Fetch all remaining blocks at once (for operations requiring full context).
     * Modifies state returning the combined blocks array.
     */
    const fetchRemainingBlocks = useCallback(async (currentBlocks) => {
        if (!hasMore || !nextCursor) return currentBlocks;

        try {
            const data = await api.getPage(pageId, 'all', nextCursor);
            const existingIds = new Set(currentBlocks.map(b => b._id));
            const newBlocks = (data.blocks || []).filter(b => !existingIds.has(b._id));

            const fullList = [...currentBlocks, ...newBlocks];
            setBlocks(fullList);
            setHasMore(false);
            setNextCursor(null);
            return fullList;
        } catch (err) {
            console.error('Failed to fetch remaining blocks:', err);
            return currentBlocks;
        }
    }, [pageId, hasMore, nextCursor]);

    /**
     * Update a block's content locally.
     * Marks page as dirty.
     */
    const updateBlockContent = useCallback((blockId, content) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block._id === blockId ? { ...block, content } : block
            )
        );
        setIsDirty(true);
    }, []);

    /**
     * Update a block's type locally.
     * Marks page as dirty.
     */
    const updateBlockType = useCallback((blockId, type) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block._id === blockId ? { ...block, type } : block
            )
        );
        setIsDirty(true);
    }, []);

    /**
     * Update any block metadata (e.g., backgroundColor).
     * Marks page as dirty.
     */
    const updateBlockMeta = useCallback((blockId, updates) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block._id === blockId ? { ...block, ...updates } : block
            )
        );
        setIsDirty(true);
    }, []);

    /**
     * Reorder blocks after drag-and-drop.
     * Marks page as dirty.
     */
    const reorderBlocks = useCallback(async (oldIndex, newIndex) => {
        if (oldIndex === newIndex) return;

        // If a reorder requires full context, fetch remaining blocks before logic
        let currentBlocks = blocks;
        if (hasMore) {
            currentBlocks = await fetchRemainingBlocks(blocks);
        }

        const newBlocks = [...currentBlocks];
        const [movedBlock] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, movedBlock);

        // Update order field for all blocks to keep local state consistent
        const reindexed = newBlocks.map((block, index) => ({
            ...block,
            order: index
        }));

        setBlocks(reindexed);
        setIsDirty(true);
    }, [blocks, hasMore, fetchRemainingBlocks]);

    /**
     * Add a new block after the specified block.
     * Marks page as dirty.
     */
    const addBlock = useCallback(async (afterBlockId, type = 'paragraph') => {
        // Create a temporary block ID for UI
        const tempId = `temp-${Date.now()}`;

        // Find the order for the new block
        const afterIndex = blocks.findIndex((b) => b._id === afterBlockId);

        const newBlock = {
            _id: tempId,
            type,
            content: { text: '' },
            pageId,
            order: 0, // Will be fixed by reordering logic or save
        };

        setBlocks((prev) => {
            const newBlocks = [...prev];
            const insertIndex = afterIndex >= 0 ? afterIndex + 1 : newBlocks.length;
            newBlocks.splice(insertIndex, 0, newBlock);

            // Re-index orders
            return newBlocks.map((b, i) => ({ ...b, order: i }));
        });

        setIsDirty(true);
        return newBlock;
    }, [blocks, pageId]);

    /**
     * Delete a block.
     * Marks page as dirty.
     */
    const removeBlock = useCallback((blockId) => {
        setBlocks((prev) => prev.filter((b) => b._id !== blockId));
        setIsDirty(true);
    }, []);

    /**
     * Add first block if page is empty.
     */
    const addFirstBlock = useCallback(async () => {
        if (blocks.length === 0) {
            return addBlock(null, 'paragraph');
        }
        return null;
    }, [blocks.length, addBlock]);

    /**
     * Save all blocks to the server.
     * Called manually by the user.
     */
    const saveAllBlocks = useCallback(async () => {
        if (!isDirty) return;

        try {
            setIsSaving(true);
            setError(null);

            // Fetch remaining so we don't accidentally delete them in PUT Sync
            let fullBlocks = blocks;
            if (hasMore) {
                fullBlocks = await fetchRemainingBlocks(blocks);
            }

            // Send full state to backend
            const { blocks: updatedBlocks } = await api.savePageContent(pageId, fullBlocks);

            // Update local state with confirmed data (IDs, etc.)
            setBlocks(updatedBlocks);
            setIsDirty(false);
            return updatedBlocks;
        } catch (err) {
            console.error('Failed to save page:', err);
            setError('Failed to save changes. Please try again.');
            return null;
        } finally {
            setIsSaving(false);
        }
    }, [pageId, blocks, isDirty, hasMore, fetchRemainingBlocks]);

    /**
     * Append blocks directly (for features like import).
     */
    const appendImportedBlocks = useCallback((newBlocks) => {
        setBlocks((prev) => [...prev, ...newBlocks]);
        // Do NOT mark as dirty automatically if they are already saved to the backend
    }, []);

    return {
        blocks,
        loading,
        error,
        isSaving,
        isDirty,
        hasMore,
        isFetchingNext,
        loadMoreBlocks,
        updateBlockContent,
        updateBlockType,
        updateBlockMeta,
        reorderBlocks,
        addBlock,
        removeBlock,
        addFirstBlock,
        saveAllBlocks,
        appendImportedBlocks,
        refreshBlocks: loadBlocks, // Used by external components to force reload
        reload: loadBlocks
    };
}

export default useBlocks;
