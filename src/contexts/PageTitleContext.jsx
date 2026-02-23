/**
 * PageTitleContext
 * ================
 * 
 * Shared state for page titles across the app.
 * 
 * WHY THIS EXISTS:
 * ----------------
 * Page blocks only store pageId (not title) to avoid stale data.
 * When a child page title changes, all page blocks referencing it
 * should update instantly without re-fetching from the server.
 * 
 * HOW IT WORKS:
 * 1. On page load, all child page titles are fetched and cached
 * 2. PageBlock reads from this cache, not block.content.title
 * 3. When editing a child page, the title is pushed to context
 * 4. Parent page's PageBlocks re-render with fresh title
 * 
 * This avoids:
 * - Storing duplicate data in blocks
 * - Stale "Untitled" titles
 * - Multiple API calls per block
 */

'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const PageTitleContext = createContext(null);

export function PageTitleProvider({ children }) {
    // Map of pageId -> title
    const [titles, setTitles] = useState({});

    /**
     * Set a single page title.
     * Called when a child page is opened or title is edited.
     */
    const setTitle = useCallback((pageId, title) => {
        setTitles((prev) => ({
            ...prev,
            [pageId]: title,
        }));
    }, []);

    /**
     * Set multiple page titles at once.
     * Called when loading a parent page with multiple page blocks.
     */
    const setTitles_ = useCallback((newTitles) => {
        setTitles((prev) => ({
            ...prev,
            ...newTitles,
        }));
    }, []);

    /**
     * Get a page title by ID.
     * Returns 'Untitled' if not found.
     */
    const getTitle = useCallback((pageId) => {
        return titles[pageId] || 'Untitled';
    }, [titles]);

    return (
        <PageTitleContext.Provider value={{ titles, setTitle, setTitles: setTitles_, getTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
}

export function usePageTitles() {
    const context = useContext(PageTitleContext);
    if (!context) {
        throw new Error('usePageTitles must be used within PageTitleProvider');
    }
    return context;
}

export default PageTitleContext;
