/**
 * useSidebar Hook
 * ================
 * 
 * Manages sidebar collapse state with localStorage persistence.
 * Provides shared state across components for layout coordination.
 * 
 * Why a shared hook instead of CSS selectors:
 * - CSS sibling selectors can't cross component boundaries
 * - Need consistent state for both sidebar and editor margin
 * - LocalStorage persistence requires JavaScript
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STORAGE_KEY = 'notionclone-sidebar-collapsed';

export function useSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load saved state from localStorage on mount (client-side only)
    useEffect(() => {
        const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (saved !== null) {
            setIsCollapsed(saved === 'true');
        }
        setIsHydrated(true);
    }, []);

    // Toggle and persist to localStorage
    const toggleSidebar = useCallback(() => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
            return newState;
        });
    }, []);

    // Explicit setters for programmatic control
    const collapseSidebar = useCallback(() => {
        setIsCollapsed(true);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
    }, []);

    const expandSidebar = useCallback(() => {
        setIsCollapsed(false);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, 'false');
    }, []);

    return {
        isCollapsed,
        isHydrated,      // True after localStorage is read (prevents flash)
        toggleSidebar,
        collapseSidebar,
        expandSidebar
    };
}

export default useSidebar;
