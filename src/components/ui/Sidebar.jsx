/**
 * Sidebar Component
 * =================
 * 
 * Collapsible sidebar with glassmorphism pastel styling.
 * Floats like a glass panel over the dreamland background.
 * 
 * Theme: Dreamland glassmorphism with pastel accents
 * - Translucent white glass effect
 * - Soft lavender/rose accents
 * - Deep neutral text for readability
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
    FileText,
    Plus,
    Trash2,
    LogOut,
    Loader2,
    PanelLeft,
    PanelLeftClose
} from 'lucide-react';
import Link from 'next/link';
import DeleteConfirmMenu from './DeleteConfirmMenu';

export function Sidebar({
    pages = [],
    loading = false,
    onCreatePage,
    onDeletePage,
    onLogout,
    creating = false,
    isCollapsed = false,
    onToggle,
    onNavigate
}) {
    const router = useRouter();
    const pathname = usePathname();

    // Extract current page ID from URL
    const currentPageId = pathname?.startsWith('/page/')
        ? pathname.split('/page/')[1]
        : null;

    return (
        <>
            {/* Sidebar Container - glassmorphism panel */}
            <aside
                className={`h-screen flex flex-col fixed left-0 top-0 z-30
                          transition-all duration-300 ease-in-out overflow-hidden
                          ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[260px] opacity-100'}`}
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)'
                }}
            >
                {/* Header with Toggle Button */}
                <div className="py-4 px-2 flex items-center justify-between min-w-[260px]"
                    style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.08)' }}>
                    <Link href="/" className="text-lg font-semibold flex items-center gap-2"
                        style={{ color: 'var(--color-text-primary)' }}>
                        <img
                            src="/logo.webp"
                            alt="Logo"
                            className="w-8 h-8 rounded-lg object-contain mt-1"
                        />
                        <span>Pagelet</span>
                    </Link>
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(15, 23, 42, 0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        title="Collapse sidebar"
                    >
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>

                {/* New Page Button */}
                <div className="p-3 min-w-[260px]">
                    <button
                        onClick={onCreatePage}
                        disabled={creating}
                        className="w-full cursor-pointer flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-all disabled:opacity-50"
                        style={{
                            color: 'var(--color-text-secondary)',
                            background: 'rgba(211, 248, 226, 1)',
                            border: '1px solid rgba(211, 248, 226, 0.6)'
                        }}
                    >
                        {creating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        {creating ? 'Creating...' : 'New Page'}
                    </button>
                </div>

                {/* Page List */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 min-w-[260px]">
                    {loading ? (
                        // Loading skeleton
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-10 rounded-xl animate-pulse"
                                    style={{ background: 'rgba(15, 23, 42, 0.05)' }} />
                            ))}
                        </div>
                    ) : pages.length === 0 ? (
                        // Empty state
                        <div className="text-center py-8">
                            <FileText className="w-10 h-10 mx-auto mb-3"
                                style={{ color: 'var(--color-text-muted)' }} />
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                No pages yet
                            </p>
                            <button
                                onClick={onCreatePage}
                                className="text-sm mt-2 transition-colors"
                                style={{ color: '#E4C1F9' }}
                            >
                                Create your first page
                            </button>
                        </div>
                    ) : (
                        // Page list
                        <div className="space-y-1">
                            {pages.map((page) => {
                                const isActive = page._id === currentPageId;
                                return (
                                    <div
                                        key={page._id}
                                        onClick={() => {
                                            if (onNavigate) {
                                                onNavigate(`/page/${page._id}`);
                                            } else {
                                                router.push(`/page/${page._id}`);
                                            }
                                        }}
                                        className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
                                                 transition-all text-sm"
                                        style={{
                                            color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                            background: isActive
                                                ? 'rgba(228, 193, 249, 0.4)'
                                                : 'transparent',
                                            border: isActive
                                                ? '1px solid rgba(228, 193, 249, 0.6)'
                                                : '1px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <FileText className="w-4 h-4 shrink-0" />
                                        <span className="flex-1 truncate">
                                            {page.title || 'Untitled'}
                                        </span>
                                        {/* Delete button - visible on hover */}
                                        <DeleteConfirmMenu
                                            onDelete={() => onDeletePage?.(page._id)}
                                            title="Delete page?"
                                            side="right"
                                            trigger={
                                                <button
                                                    className="opacity-0 cursor-pointer group-hover:opacity-100 p-1 transition-opacity rounded"
                                                    style={{ color: 'var(--color-text-muted)' }}
                                                    onMouseEnter={(e) => e.target.style.color = '#F694C1'}
                                                    onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 min-w-[260px]" style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
                    <button
                        onClick={onLogout}
                        className="w-full cursor-pointer flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-all"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(246, 148, 193, 0.2)';
                            e.currentTarget.style.color = '#F694C1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Expand Button - visible when collapsed */}
            <button
                onClick={onToggle}
                className={`fixed top-4 cursor-pointer left-4 z-40 p-2.5 rounded-xl transition-all duration-300 ease-in-out
                          ${isCollapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    color: 'var(--color-text-secondary)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                }}
                title="Expand sidebar"
            >
                <PanelLeft className="w-5 h-5" />
            </button>
        </>
    );
}

export default Sidebar;
