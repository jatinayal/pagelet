/**
 * FloatingStyleMenu Component
 * ===========================
 * 
 * A floating mini toolbar that appears when text is selected.
 * Provides Bold, Italic, and Underline formatting options.
 * 
 * How Text Selection Converts to Style Ranges
 * --------------------------------------------
 * 1. User selects text in a textarea/input
 * 2. selectionStart and selectionEnd give character indices
 * 3. These indices become the 'start' and 'end' of a style mark
 * 4. Mark is stored as: { type: 'bold'|'italic'|'underline', start, end }
 * 5. On render, text is split at all mark boundaries and styled spans applied
 * 
 * This approach:
 * - Keeps raw text clean (no HTML/markdown)
 * - Allows overlapping styles (bold+italic on same range)
 * - Is fully deterministic and backend-driven
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

export function FloatingStyleMenu({
    targetRef,           // Ref to the textarea/input element
    marks = [],          // Current style marks
    onStyleChange,       // Callback: (newMarks) => void
    applyMark,           // Utility function
    removeMark           // Utility function
}) {
    const [position, setPosition] = useState(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const menuRef = useRef(null);

    // Check for text selection and position menu
    const updateSelection = useCallback(() => {
        const target = targetRef?.current;
        if (!target) {
            setPosition(null);
            return;
        }

        const start = target.selectionStart;
        const end = target.selectionEnd;

        // Only show if there's an actual selection (not just cursor)
        if (start === end || document.activeElement !== target) {
            setPosition(null);
            return;
        }

        setSelection({ start, end });

        // Calculate position based on textarea location
        const rect = target.getBoundingClientRect();

        // Position menu above the textarea, centered
        setPosition({
            top: rect.top - 45,  // Above the element
            left: rect.left + rect.width / 2 - 60  // Centered (menu is ~120px wide)
        });
    }, [targetRef]);

    // Listen for selection changes
    useEffect(() => {
        const target = targetRef?.current;
        if (!target) return;

        const handleSelectionChange = () => {
            // Small delay to let selection settle
            requestAnimationFrame(updateSelection);
        };

        // Multiple events to catch selection
        target.addEventListener('select', handleSelectionChange);
        target.addEventListener('mouseup', handleSelectionChange);
        target.addEventListener('keyup', handleSelectionChange);
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            target.removeEventListener('select', handleSelectionChange);
            target.removeEventListener('mouseup', handleSelectionChange);
            target.removeEventListener('keyup', handleSelectionChange);
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [targetRef, updateSelection]);

    // Hide menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) &&
                targetRef?.current && !targetRef.current.contains(e.target)) {
                setPosition(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [targetRef]);

    // Apply a style to the current selection
    const handleStyle = (type) => {
        const { start, end } = selection;
        if (start === end) return;

        // Check if already styled
        const isStyled = marks.some(m =>
            m.type === type && m.start <= start && m.end >= end
        );

        const newMarks = isStyled
            ? removeMark(marks, type, start, end)
            : applyMark(marks, type, start, end);

        onStyleChange(newMarks);

        // Keep focus on textarea
        targetRef?.current?.focus();
    };

    // Check if a style is active for current selection
    const isActive = (type) => {
        const { start, end } = selection;
        return marks.some(m => m.type === type && m.start <= start && m.end >= end);
    };

    if (!position) return null;

    return (
        <div
            ref={menuRef}
            data-style-menu="true"
            className="fixed z-50 flex items-center gap-1 px-2 py-1.5 
                       bg-gray-800/95 backdrop-blur-xl border border-white/10 
                       rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{ top: position.top, left: position.left }}
        >
            <button
                onClick={() => handleStyle('bold')}
                className={`p-1.5 rounded transition-colors ${isActive('bold')
                    ? 'bg-indigo-500/30 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </button>

            <button
                onClick={() => handleStyle('italic')}
                className={`p-1.5 rounded transition-colors ${isActive('italic')
                    ? 'bg-indigo-500/30 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </button>

            <button
                onClick={() => handleStyle('underline')}
                className={`p-1.5 rounded transition-colors ${isActive('underline')
                    ? 'bg-indigo-500/30 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                title="Underline (Ctrl+U)"
            >
                <Underline className="w-4 h-4" />
            </button>
        </div>
    );
}

export default FloatingStyleMenu;
