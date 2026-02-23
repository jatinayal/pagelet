/**
 * PageBlock Component
 * ===================
 * 
 * Renders a reference to a child/nested page.
 * 
 * GHOST BLOCK HANDLING:
 * ---------------------
 * - If title is "Untitled" and page doesn't exist, show delete option
 * - onDelete callback removes the page block from parent
 * - Prevents orphan page blocks from lingering in UI
 */

import { FileText, ChevronRight, Trash2, AlertCircle } from 'lucide-react';
import { usePageTitles } from '@/contexts/PageTitleContext';
import { DeleteConfirmMenu } from '@/components/ui';

export function PageBlock({ block, onClick, onDelete, readOnly }) {
    const { getTitle, titles } = usePageTitles();

    const pageId = block.content?.pageId;
    // Use title from block content (public view) or context (private view)
    const title = block.content?.title || getTitle(pageId);

    // Check if this is potentially an orphan (no title cached = never fetched = might not exist)
    // In read-only (public) mode, we don't track orphans (we rely on injected title)
    const isOrphan = !readOnly && pageId && titles[pageId] === undefined;

    const handleClick = (e) => {
        // Don't navigate if clicking delete button container
        if (e.target.closest('.delete-btn') || e.target.closest('.delete-confirm-menu')) return;

        if (pageId && onClick) {
            onClick(pageId);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
    border transition-colors duration-200
    ${isOrphan
                    ? 'bg-red-500/10 border-red-500/20 hover:border-red-500/30'
                    : 'bg-zinc-900/5 border-black/5 hover:bg-zinc-900/8 hover:border-black/10'}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
        >
            {/* Page icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
  ${isOrphan
                    ? 'bg-red-500/15'
                    : 'bg-black/5 group-hover:bg-black/10'}`}>
                {isOrphan ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                    <FileText className="w-4 h-4 text-zinc-500 group-hover:text-zinc-700 transition-colors" />
                )}
            </div>

            {/* Title from context */}
            <span className={`flex-1 font-medium truncate transition-opacity duration-200
   ${isOrphan ? 'text-red-500' : 'text-zinc-800'}`}>
                {isOrphan ? 'Missing page' : title}
            </span>

            {/* Interaction Area: Delete Button OR Confirmation Menu */}
            {!readOnly && (
                <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
                    <DeleteConfirmMenu
                        onDelete={() => onDelete && onDelete(block._id, pageId)}
                        title="Delete page?"
                        side="left"
                        trigger={
                            <button
                                className="delete-btn p-1.5 cursor-pointer text-zinc-400 hover:text-red-500 hover:bg-red-500/10 
                                      rounded-lg transition-all duration-200
                                      opacity-0 group-hover:opacity-100 scale-100"
                                title="Delete page block"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        }
                    />
                </div>
            )}

            {/* Arrow indicator - hide for orphans */}
            {!isOrphan && (
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors duration-200" />
            )}
        </div>
    );
}

export default PageBlock;
