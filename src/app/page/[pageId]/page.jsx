/**
 * Page Editor
 * ===========
 * 
 * Block-based editor with nested page support.
 * 
 * NESTED PAGES ARCHITECTURE:
 * --------------------------
 * - Page blocks contain a reference (pageId) to a child page
 * - Clicking a page block opens that child page in the same editor
 * - Breadcrumb shows navigation path back to parent
 * - Child pages are NOT shown in the sidebar
 * - This creates a tree structure while keeping URLs flat
 */

'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBlocks } from '@/hooks/useBlocks';
import { useSidebar } from '@/hooks/useSidebar';
import { BlockRenderer } from '@/components/blocks';
import { EditorSkeleton, Sidebar, ChatWidget, DeleteConfirmMenu, UnsavedGuardModal } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import * as api from '@/lib/apiClient';
import { handleAIResult } from '@/lib/aiActionHandler';
import { usePageTitles } from '@/contexts/PageTitleContext';
import {
    GripVertical,
    Type,
    Heading1,
    Heading2,
    Heading3,
    CheckSquare,
    Code,
    FileText,
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    TextQuote,
    Palette,
    Save,
    Loader2,
    Globe,
    Copy,
    Check,
    Image,
    Link,
} from 'lucide-react';

export default function PageEditor({ params }) {
    const { pageId } = use(params);
    const router = useRouter();
    const { logout } = useAuth({ required: true });
    const { setTitle, setTitles } = usePageTitles();
    const { isCollapsed, toggleSidebar } = useSidebar();

    const {
        blocks,
        loading,
        error,
        updateBlockContent,
        updateBlockType,
        updateBlockMeta,
        reorderBlocks,
        addBlock,
        removeBlock,
        addFirstBlock,
        isDirty,
        isSaving,
        hasMore,
        isFetchingNext,
        loadMoreBlocks,
        saveAllBlocks,
        refreshBlocks,
    } = useBlocks(pageId);

    // Observer target for infinite scrolling
    const observerTarget = useRef(null);

    // Page data
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);
    const [pageTitle, setPageTitle] = useState('');
    const [titleLoaded, setTitleLoaded] = useState(false);
    const [pagesLoading, setPagesLoading] = useState(true);

    // Public Share State
    const [isPublic, setIsPublic] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Navigation stack for breadcrumb (parent pages)
    const [breadcrumb, setBreadcrumb] = useState([]);

    // UI state
    const [focusedBlockId, setFocusedBlockId] = useState(null);
    const [showTypeMenu, setShowTypeMenu] = useState(null);
    const [showColorMenu, setShowColorMenu] = useState(null); // For block background color picker

    /**
     * Block background color palette - Dreamland pastel colors.
     * These match the global palette and create a cohesive glass-on-glass effect.
     * Colors are applied with reduced opacity for soft, dreamy backgrounds.
     */
    const colorPalette = [
        { hex: '#EDE7B1', label: 'Cream' },      // Soft yellow/cream
        { hex: '#D3F8E2', label: 'Mint' },       // Soft green
        { hex: '#A9DEF9', label: 'Sky' },        // Soft blue
        { hex: '#E4C1F9', label: 'Lavender' },   // Soft purple
        { hex: '#F694C1', label: 'Rose' },       // Soft pink
        { hex: null, label: 'Clear' },
    ];

    /**
     * Drag-and-Drop State Management
     * --------------------------------
     * draggedBlockId: The block currently being dragged
     * dropTargetIndex: Visual indicator position (insertion line)
     * 
     * Flow:
     * 1. User grabs handle -> sets draggedBlockId
     * 2. User drags over blocks -> updates dropTargetIndex for visual feedback
     * 3. User drops -> reorderBlocks(oldIndex, newIndex)
     * 4. Backend persists new order immediately
     */
    const [draggedBlockId, setDraggedBlockId] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

    // Title debounce
    const titleDebounceRef = useRef(null);

    // Load page data and sidebar pages
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load current page with its parent info
                const { page } = await api.getPage(pageId, 10, null);
                setCurrentPage(page);
                setPageTitle(page.title || '');
                setIsPublic(page.isPublic || false);
                setTitleLoaded(true);

                // Build breadcrumb from parent chain
                if (page.parentPageId) {
                    await buildBreadcrumb(page.parentPageId);
                } else {
                    setBreadcrumb([]);
                }

                // Load root pages for sidebar
                const { pages: allPages } = await api.getPages();
                setPages(allPages || []);

                // Cache current page title in context
                setTitle(page._id, page.title);
            } catch (err) {
                if (err?.message?.includes('Authentication')) {
                    router.push('/login');
                }
            } finally {
                setPagesLoading(false);
            }
        };
        loadData();
    }, [pageId, router, setTitle]);

    // Intersection Observer for Infinite Scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetchingNext) {
                    loadMoreBlocks();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, isFetchingNext, loadMoreBlocks]);

    // Build breadcrumb by walking up the parent chain
    const buildBreadcrumb = async (parentId) => {
        const crumbs = [];
        let currentParentId = parentId;

        // Walk up the parent chain (limit to 10 to prevent infinite loops)
        for (let i = 0; i < 10 && currentParentId; i++) {
            try {
                const { page } = await api.getPage(currentParentId);
                crumbs.unshift({ _id: page._id, title: page.title });
                currentParentId = page.parentPageId;
            } catch {
                break;
            }
        }

        setBreadcrumb(crumbs);
    };

    // Add first block if empty
    useEffect(() => {
        if (!loading && blocks.length === 0 && titleLoaded) {
            addFirstBlock().then((block) => {
                if (block) setFocusedBlockId(block._id);
            });
        }
    }, [loading, blocks.length, titleLoaded, addFirstBlock]);

    /**
     * Fetch titles for all child pages referenced by page blocks.
     * This runs once when blocks are loaded, caching all titles
     * in a single batch to avoid N+1 API calls.
     */
    useEffect(() => {
        if (loading || blocks.length === 0) return;

        const fetchChildTitles = async () => {
            // Find all page blocks
            const pageBlocks = blocks.filter((b) => b.type === 'page');
            if (pageBlocks.length === 0) return;

            // Fetch each child page and cache its title
            const titleMap = {};
            await Promise.all(
                pageBlocks.map(async (block) => {
                    const childId = block.content?.pageId;
                    if (!childId) return;

                    try {
                        const { page } = await api.getPage(childId);
                        titleMap[childId] = page.title || 'Untitled';
                    } catch {
                        titleMap[childId] = 'Untitled';
                    }
                })
            );

            // Batch update all titles at once
            setTitles(titleMap);
        };

        fetchChildTitles();
    }, [loading, blocks, setTitles]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setPageTitle(newTitle);

        // Update sidebar if it's a root page
        setPages((prev) =>
            prev.map((p) => p._id === pageId ? { ...p, title: newTitle } : p)
        );

        // Update shared context so parent page blocks see the new title
        setTitle(pageId, newTitle);

        // Debounced save
        clearTimeout(titleDebounceRef.current);
        titleDebounceRef.current = setTimeout(() => {
            api.updatePage(pageId, { title: newTitle });
        }, 500);
    };

    const handleBlockKeyDown = useCallback(async (e, block) => {
        // Enter: Create new block below (except in code blocks)
        if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
            e.preventDefault();
            const newBlock = await addBlock(block._id, 'paragraph');
            if (newBlock) {
                setFocusedBlockId(newBlock._id);
            }
        }

        // Backspace on empty: Delete and focus previous
        if (e.key === 'Backspace') {
            const content = block.content?.text || block.content?.code || '';
            if (content === '' && blocks.length > 1 && block.type !== 'page') {
                e.preventDefault();
                const currentIndex = blocks.findIndex((b) => b._id === block._id);
                const prevBlock = blocks[currentIndex - 1];

                await removeBlock(block._id);

                if (prevBlock) {
                    setFocusedBlockId(prevBlock._id);
                }
            }
        }
    }, [blocks, addBlock, removeBlock]);

    // Navigate to a child page (from page block click)
    const handlePageBlockClick = (childPageId) => {
        withUnsavedGuard(() => {
            router.push(`/page/${childPageId}`);
        });
    };

    // Navigate back to parent page
    const handleBackClick = () => {
        withUnsavedGuard(() => {
            if (breadcrumb.length > 0) {
                const parent = breadcrumb[breadcrumb.length - 1];
                router.push(`/page/${parent._id}`);
            } else {
                router.push('/dashboard');
            }
        });
    };

    // Unsaved Guard Modal State
    const [showUnsavedGuard, setShowUnsavedGuard] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    /**
     * Helper to guard navigation/creation actions if page is dirty
     */
    const withUnsavedGuard = (actionFn) => {
        if (isDirty) {
            setPendingAction(() => actionFn);
            setShowUnsavedGuard(true);
        } else {
            actionFn();
        }
    };

    const handleGuardDiscardAndContinue = () => {
        // Technically, by navigating away, we discard block state automatically 
        // because the component unmounts. However, to be safe and clean:
        refreshBlocks(); // Resets local blocks to DB state, clearing isDirty
        setShowUnsavedGuard(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleGuardCancel = () => {
        setShowUnsavedGuard(false);
        setPendingAction(null);
    };

    // Sidebar actions
    const handleCreatePage = () => {
        withUnsavedGuard(async () => {
            const { page } = await api.createPage('Untitled');
            setPages((prev) => [page, ...prev]);
            router.push(`/page/${page._id}`);
        });
    };

    const handleDeletePage = async (deletePageId) => {
        const result = await api.deletePage(deletePageId);
        setPages((prev) => prev.filter((p) => p._id !== deletePageId));

        if (deletePageId === pageId) {
            router.push('/dashboard');
        }
    };

    /**
     * Delete the currently open page.
     * Navigates to parent page if exists, otherwise dashboard.
     */
    const handleDeleteCurrentPage = async () => {
        try {
            const result = await api.deletePage(pageId);

            // Update sidebar for root pages
            setPages((prev) => prev.filter((p) => p._id !== pageId));

            // Navigate to parent if exists, otherwise dashboard
            if (result.parentPageId) {
                router.push(`/page/${result.parentPageId}`);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Failed to delete page:', err);
        }
    };

    // Create a nested page block
    const handleAddPageBlock = () => {
        withUnsavedGuard(async () => {
            try {
                // At this point, if it was dirty, it has already been saved or discarded
                // So `blocks` reflects exactly what is on the server
                const lastBlock = blocks[blocks.length - 1];

                const { block } = await api.createPageBlock(pageId, lastBlock?._id, 'Untitled');
                refreshBlocks(); // Reload blocks to show new page block
            } catch (err) {
                console.error('Failed to create page block:', err);
            }
        });
    };

    /**
     * Delete a page block and its referenced child page.
     * Called from PageBlock's delete button.
     */
    const handlePageBlockDelete = async (blockId, childPageId) => {
        try {
            // Delete the child page (this also removes the block on backend)
            if (childPageId) {
                await api.deletePage(childPageId);
            } else {
                // No child page, just delete the orphan block
                await api.deleteBlock(blockId);
            }
            // Refresh to remove the block from UI
            refreshBlocks();
        } catch (err) {
            console.error('Failed to delete page block:', err);
        }
    };

    // Block type options with Lucide icons
    const blockTypes = [
        { type: 'paragraph', label: 'Text', Icon: Type },
        { type: 'heading1', label: 'Heading 1', Icon: Heading1 },
        { type: 'heading2', label: 'Heading 2', Icon: Heading2 },
        { type: 'heading3', label: 'Heading 3', Icon: Heading3 },
        { type: 'todo', label: 'To-do', Icon: CheckSquare },
        { type: 'code', label: 'Code', Icon: Code },
        { type: 'quote', label: 'Quote', Icon: TextQuote },
        { type: 'image', label: 'Image', Icon: Image },
        { type: 'link', label: 'Link', Icon: Link },
        { type: 'page', label: 'Page', Icon: FileText },
    ];

    const handleTypeChange = async (blockId, newType) => {
        // Special case: converting to page block
        if (newType === 'page') {
            try {
                // Delete the old block and create a page block
                await removeBlock(blockId);
                await api.createPageBlock(pageId, null, 'Untitled');
                refreshBlocks();
            } catch (err) {
                console.error('Failed to convert to page block:', err);
            }
        } else {
            updateBlockType(blockId, newType);
        }
        setShowTypeMenu(null);
    };

    const handleTogglePublic = async () => {
        try {
            const newStatus = !isPublic;
            // Optimistic update
            setIsPublic(newStatus);
            await api.updatePageVisibility(pageId, newStatus);
        } catch (err) {
            console.error('Failed to update visibility:', err);
            setIsPublic(!isPublic); // Rollback
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/public/${pageId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Check if current page is a child page
    const isChildPage = currentPage?.parentPageId != null;

    return (
        <div className="min-h-screen">
            {/* Sidebar */}
            <Sidebar
                pages={pages}
                loading={pagesLoading}
                onCreatePage={handleCreatePage}
                onDeletePage={handleDeletePage}
                onNavigate={(url) => withUnsavedGuard(() => router.push(url))}
                onLogout={logout}
                isCollapsed={isCollapsed}
                onToggle={toggleSidebar}
            />

            {/* Editor Area - margin transitions smoothly with sidebar */}
            <div className={`min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out
                          ${isCollapsed ? 'ml-0' : 'ml-[260px]'}`}>
                {/* Editor Header - glass panel */}
                <header className="sticky top-0 z-10"
                    style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                    <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
                        {/* Breadcrumb Navigation */}
                        <div className="flex items-center gap-2 text-sm">
                            {isChildPage && (
                                <>
                                    <button
                                        onClick={handleBackClick}
                                        className="flex items-center gap-1 transition-colors"
                                        style={{ color: 'var(--color-text-muted)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Back
                                    </button>

                                    {breadcrumb.length > 0 && (
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <span className="mx-2">/</span>
                                            {breadcrumb.map((crumb, index) => (
                                                <span key={crumb._id} className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => router.push(`/page/${crumb._id}`)}
                                                        className="text-gray-500 hover:text-gray-300 transition-colors truncate max-w-[100px]"
                                                    >
                                                        {crumb.title || 'Untitled'}
                                                    </button>
                                                    {index < breadcrumb.length - 1 && (
                                                        <ChevronRight className="w-3 h-3 text-gray-600" />
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Right side: Save & Delete Actions */}
                        <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/40 p-1 rounded-xl shadow-sm relative">

                            {/* Share Button & Popover */}
                            <div className="relative">
                                <button
                                    onClick={() => setShareOpen(!shareOpen)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm
                                        ${isPublic ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-700'}`}
                                >
                                    <Globe className="w-4 h-4" />
                                    <span>Access</span>
                                </button>

                                {shareOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white/90 backdrop-blur-xl border border-white/20 
                                            rounded-xl shadow-xl p-4 z-20 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-medium text-gray-700">Public Access</span>
                                            <button
                                                onClick={handleTogglePublic}
                                                className={`relative inline-flex cursor-pointer h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                                    ${isPublic ? 'bg-indigo-500' : 'bg-gray-200'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                        ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>

                                        {isPublic && (
                                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <input
                                                    readOnly
                                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/public/${pageId}`}
                                                    className="flex-1 bg-transparent text-xs text-gray-500 outline-none truncate"
                                                />
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-500 shadow-sm"
                                                    title="Copy link"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 cursor-pointer" />}
                                                </button>
                                            </div>
                                        )}

                                        {!isPublic && (
                                            <p className="text-xs text-gray-400">
                                                Publish this page to the web. Anyone with the link can view it.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <UnsavedGuardModal
                                isOpen={showUnsavedGuard}
                                onDiscardAndContinue={handleGuardDiscardAndContinue}
                                onCancel={handleGuardCancel}
                            />

                            <div className="w-px h-6 bg-gray-300/50 mx-1"></div>

                            <button
                                onClick={saveAllBlocks}
                                disabled={!isDirty || isSaving}
                                className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm"
                                style={{
                                    color: isDirty
                                        ? 'var(--color-text-primary)'
                                        : 'var(--color-text-secondary)',

                                    background: isDirty
                                        ? 'rgba(99, 102, 241, 0.15)' // soft indigo
                                        : 'transparent',

                                    border: isDirty
                                        ? '1px solid rgba(99, 102, 241, 0.4)'
                                        : '1px solid transparent',

                                    opacity: isSaving ? 0.7 : 1,
                                    pointerEvents: !isDirty || isSaving ? 'none' : 'auto'
                                }}
                                title="Save changes"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>


                            <div className="w-px h-6 bg-gray-300/50 mx-1"></div>

                            <DeleteConfirmMenu
                                onDelete={handleDeleteCurrentPage}
                                title="Delete page?"
                                description="This will delete the page and all its content."
                                side="bottom-left"
                                trigger={
                                    <button
                                        className="p-1.5 cursor-pointer text-gray-500 hover:text-red-500 hover:bg-red-500/10 
                                           rounded-lg transition-colors"
                                        title="Delete page"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                }
                            />
                        </div>
                    </div>
                </header>

                {/* Editor Content */}
                {loading ? (
                    <EditorSkeleton />
                ) : error ? (
                    <div className="max-w-3xl mx-auto px-6 py-8">
                        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400">
                            {error}
                        </div>
                    </div>
                ) : (
                    <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 dot-grid-bg">
                        {/* Page Title */}
                        <input
                            type="text"
                            value={pageTitle}
                            onChange={handleTitleChange}
                            placeholder="Untitled"
                            className="w-full text-6xl font-bold bg-transparent outline-none mb-8 leading-tight"
                            style={{
                                color: 'var(--color-text-primary)',
                                '::placeholder': { color: 'var(--color-text-muted)' }
                            }}
                        />

                        {/* Blocks */}
                        <div className="space-y-1">
                            {blocks.map((block, blockIndex) => {
                                const isFocused = block._id === focusedBlockId;
                                const isPageBlock = block.type === 'page';

                                /**
                                 * Background styling for glass card effect.
                                 * Blocks with colors get a frosted glass appearance.
                                 * Uses pastel colors with 40% opacity for dreamy effect.
                                 */
                                const bgStyle = block.backgroundColor
                                    ? {
                                        backgroundColor: `${block.backgroundColor}66`, // 40% opacity
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.4)'
                                    }
                                    : {};

                                return (
                                    <div
                                        key={block._id}
                                        className={`group relative rounded-xl transition-all 
                                            ${block.backgroundColor ? 'px-4 py-2' : ''}
                                            ${draggedBlockId === block._id ? 'opacity-50 scale-[0.98]' : ''}`}
                                        style={bgStyle}
                                        onFocus={() => setFocusedBlockId(block._id)}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            // Calculate drop position based on mouse Y relative to block
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const midY = rect.top + rect.height / 2;
                                            const insertIndex = e.clientY < midY ? blockIndex : blockIndex + 1;
                                            setDropTargetIndex(insertIndex);
                                        }}
                                        onDragLeave={() => setDropTargetIndex(null)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedBlockId && dropTargetIndex !== null) {
                                                const oldIndex = blocks.findIndex(b => b._id === draggedBlockId);
                                                // Adjust target index if dropping after original position
                                                let newIndex = dropTargetIndex;
                                                if (oldIndex < dropTargetIndex) newIndex--;
                                                reorderBlocks(oldIndex, Math.max(0, newIndex));
                                            }
                                            setDraggedBlockId(null);
                                            setDropTargetIndex(null);
                                        }}
                                    >
                                        {/* Drop Indicator Line - lavender accent */}
                                        {dropTargetIndex === blockIndex && draggedBlockId !== block._id && (
                                            <div className="absolute -top-1 left-0 right-0 h-0.5 rounded-full"
                                                style={{ background: '#E4C1F9', boxShadow: '0 0 8px rgba(228, 193, 249, 0.6)' }} />
                                        )}
                                        {/* Block Controls - visible on hover (not for page blocks) */}
                                        {!isPageBlock && (
                                            <div className="absolute -left-20 top-1 opacity-0 group-hover:opacity-100 
                                      transition-opacity flex items-center gap-0.5">
                                                {/* Drag Handle - the ONLY draggable element */}
                                                <div
                                                    draggable
                                                    onDragStart={(e) => {
                                                        setDraggedBlockId(block._id);
                                                        e.dataTransfer.effectAllowed = 'move';
                                                        e.dataTransfer.setData('text/plain', block._id);
                                                    }}
                                                    onDragEnd={() => {
                                                        setDraggedBlockId(null);
                                                        setDropTargetIndex(null);
                                                    }}
                                                    className="p-1 cursor-grab active:cursor-grabbing transition-colors rounded"
                                                    style={{ color: 'var(--color-text-muted)' }}
                                                    title="Drag to reorder"
                                                >
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                {/* Color Picker Button */}
                                                <button
                                                    onClick={() => setShowColorMenu(showColorMenu === block._id ? null : block._id)}
                                                    className="p-1 transition-colors rounded cursor-pointer"
                                                    style={{ color: 'var(--color-text-muted)' }}
                                                    title="Block color"
                                                >
                                                    <Palette className="w-4 h-4" />
                                                </button>

                                                {/* Color Menu - glass panel */}
                                                {showColorMenu === block._id && (
                                                    <div className="absolute left-0 top-7 z-20 p-2 flex flex-col gap-1.5 rounded-xl"
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            backdropFilter: 'blur(12px)',
                                                            WebkitBackdropFilter: 'blur(12px)',
                                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                                                        }}>
                                                        {colorPalette.map(({ hex, label }) => (
                                                            <button
                                                                key={label}
                                                                onClick={() => {
                                                                    updateBlockMeta(block._id, { backgroundColor: hex });
                                                                    setShowColorMenu(null);
                                                                }}
                                                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110
                                                                    ${hex === block.backgroundColor ? 'border-gray-500' : 'border-transparent'}
                                                                    ${!hex ? 'border-dashed' : ''}`}
                                                                style={hex ? { backgroundColor: hex } : { background: 'rgba(15, 23, 42, 0.1)' }}
                                                                title={label}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Type Menu Button (now using Menu icon since GripVertical is drag handle) */}
                                                <button
                                                    onClick={() => setShowTypeMenu(showTypeMenu === block._id ? null : block._id)}
                                                    className="p-1 text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
                                                    title="Change block type."
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className='text-gray-500' width="20" height="20" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M4.129 3.774c0-.427.347-.774.774-.774h6.194a.774.774 0 0 1 0 1.548H8.774v7.484a.774.774 0 0 1-1.548 0V4.548H4.903a.774.774 0 0 1-.774-.774m-.743 1.517a.774.774 0 0 1 0 1.095L1.87 7.903L3.386 9.42a.774.774 0 0 1-1.095 1.095L.227 8.451a.774.774 0 0 1 0-1.095L2.29 5.29a.774.774 0 0 1 1.095 0m9.228 0a.774.774 0 0 1 1.095 0l2.064 2.065a.774.774 0 0 1 0 1.095l-2.064 2.064a.774.774 0 0 1-1.095-1.095l1.517-1.517l-1.517-1.517a.774.774 0 0 1 0-1.095" clipRule="evenodd" /></svg>
                                                </button>

                                                {/* Type Menu Dropdown */}
                                                {showTypeMenu === block._id && (
                                                    <div className="absolute left-6 top-7 z-20 bg-gray-800/80 backdrop-blur-3xl
                                          border border-white/10 rounded-xl shadow-xl py-2 min-w-[160px]">
                                                        {blockTypes.map(({ type, label, Icon }) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => handleTypeChange(block._id, type)}
                                                                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3
                                            hover:bg-white/5 transition-colors
                                            ${block.type === type ? 'text-indigo-400' : 'text-gray-300'}`}
                                                            >
                                                                <Icon className="w-4 h-4 opacity-60" />
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Block Content with focus indicator */}
                                        <div
                                            className={`pl-2 border-l-2 transition-colors
                                  ${isFocused && !isPageBlock ? 'border-indigo-500/50' : 'border-transparent hover:border-gray-700'}`}
                                            onClick={() => { setShowTypeMenu(null); setShowColorMenu(null); }}
                                        >
                                            <BlockRenderer
                                                block={block}
                                                onChange={(content) => updateBlockContent(block._id, content)}
                                                onKeyDown={handleBlockKeyDown}
                                                autoFocus={focusedBlockId === block._id}
                                                onPageClick={handlePageBlockClick}
                                                onPageDelete={handlePageBlockDelete}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sentinel Div for Infinite Scroll */}
                        {hasMore && (
                            <div ref={observerTarget} className="flex justify-center py-4 my-2">
                                {isFetchingNext ? (
                                    <div className="flex items-center gap-2 text-indigo-400 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Loading more blocks...</span>
                                    </div>
                                ) : (
                                    <div className="h-4 w-full"></div>
                                )}
                            </div>
                        )}

                        {/* Add Block Buttons */}
                        <div className="mt-6 flex items-center gap-2">
                            <button
                                onClick={() => addBlock(blocks[blocks.length - 1]?._id, 'paragraph')}
                                className="flex items-center gap-2 px-3 py-2 text-gray-500 
                           hover:text-gray-700  cursor-pointer  hover:bg-white/5 rounded-lg
                           text-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add a block
                            </button>
                            <button
                                onClick={handleAddPageBlock}
                                className="flex items-center gap-2 px-3 py-2 text-gray-500 
                           hover:text-gray-700 hover:bg-white/5 rounded-lg
                           text-sm cursor-pointer transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                Add a page
                            </button>
                        </div>
                    </main>
                )}
            </div>

            {/* AI Chat Widget */}
            <ChatWidget
                pageContext={{ title: pageTitle, blocks: blocks }}
                onExecuteActions={(data) => handleAIResult(data, { pageId, refreshBlocks })}
            />
        </div>
    );
}
