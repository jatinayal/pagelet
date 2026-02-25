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
import { Bold, Italic, Underline, ChevronDown } from 'lucide-react';

const FONTS = [
    { value: 'modern', label: 'Default', css: 'var(--font-modern, sans-serif)' },
    { value: 'serif', label: 'Serif', css: 'var(--font-serif, serif)' },
    { value: 'mono', label: 'Mono', css: 'var(--font-mono, monospace)' }
];

export function FloatingStyleMenu({
    targetRef,           // Ref to the textarea/input element
    marks = [],          // Current style marks
    onStyleChange,       // Callback: (newMarks) => void
    applyMark,           // Utility function
    removeMark,          // Utility function
    fontFamily = 'modern',
    onFontChange
}) {
    const [position, setPosition] = useState(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
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
        if (start === end) {
            setPosition(null);
            return;
        }

        // Hide if focus moves outside both the textarea and the styling menu
        if (document.activeElement !== target && !menuRef.current?.contains(document.activeElement)) {
            setPosition(null);
            return;
        }

        setSelection({ start, end });

        // Calculate position based on textarea location
        const rect = target.getBoundingClientRect();

        // Approximate menu dimensions
        const menuWidth = 120;
        const menuHeight = 40;
        const gap = 10;

        // Horizontal Centering
        let leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);

        // Horizontal Clamping
        const padding = 16;
        if (leftPos < padding) {
            leftPos = padding;
        } else if (leftPos + menuWidth > window.innerWidth - padding) {
            leftPos = window.innerWidth - menuWidth - padding;
        }

        // Vertical Positioning (Default: Above)
        let topPos = rect.top - menuHeight - gap;

        // Vertical Clamping: If it overflows the top of the viewport, position below
        if (topPos < padding) {
            topPos = rect.bottom + gap;
        }

        setPosition({
            top: topPos,
            left: leftPos
        });
    }, [targetRef]);

    // Listen for selection and scroll/resize changes
    useEffect(() => {
        const target = targetRef?.current;
        if (!target) return;

        const handleSelectionChange = () => {
            // Small delay to let selection and layout operations settle
            requestAnimationFrame(updateSelection);
        };

        // DOM Element Events
        target.addEventListener('select', handleSelectionChange);
        target.addEventListener('mouseup', handleSelectionChange);
        target.addEventListener('keyup', handleSelectionChange);
        document.addEventListener('selectionchange', handleSelectionChange);

        // Window & Scroll Events (capture phase for all scrolls)
        window.addEventListener('resize', handleSelectionChange, { passive: true });
        window.addEventListener('scroll', handleSelectionChange, { passive: true, capture: true });

        return () => {
            target.removeEventListener('select', handleSelectionChange);
            target.removeEventListener('mouseup', handleSelectionChange);
            target.removeEventListener('keyup', handleSelectionChange);
            document.removeEventListener('selectionchange', handleSelectionChange);
            window.removeEventListener('resize', handleSelectionChange, { capture: true });
            window.removeEventListener('scroll', handleSelectionChange, { capture: true });
        };
    }, [targetRef, updateSelection]);

    // Hide menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Close the font menu specifically if clicking outside of its toggle container
            if (!e.target.closest('[data-font-dropdown="true"]')) {
                setIsFontMenuOpen(false);
            }

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
                       bg-white/95 backdrop-blur-xl border border-white/10 
                       rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{ top: position.top, left: position.left }}
        >
            <div className="relative" data-font-dropdown="true">
                <button
                    onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
                    className="flex items-center justify-between gap-1.5 bg-transparent hover:bg-gray-100 transition-colors text-xs font-medium text-gray-700 rounded px-2 py-1 cursor-pointer outline-none border-none min-w-[90px]"
                >
                    <span>{FONTS.find(f => f.value === (fontFamily || 'modern'))?.label || 'Default'}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                </button>

                {isFontMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-32 py-1 bg-white/95 backdrop-blur-xl border border-gray-100/50 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        {FONTS.map(font => (
                            <button
                                key={font.value}
                                onClick={() => {
                                    onFontChange?.(font.value);
                                    setIsFontMenuOpen(false);
                                    targetRef?.current?.focus();
                                }}
                                className={`block cursor-pointer w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-indigo-50/50 ${fontFamily === font.value ? 'text-indigo-600 font-semibold' : 'text-gray-700 font-medium'
                                    }`}
                                style={{ fontFamily: font.css }}
                            >
                                {font.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <button
                onClick={() => handleStyle('bold')}
                className={`p-1.5 cursor-pointer rounded transition-colors ${isActive('bold')
                    ? 'bg-indigo-500/30 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </button>

            <button
                onClick={() => handleStyle('italic')}
                className={`p-1.5 cursor-pointer rounded transition-colors ${isActive('italic')
                    ? 'bg-indigo-500/30 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </button>

            <button
                onClick={() => handleStyle('underline')}
                className={`p-1.5 cursor-pointer rounded transition-colors ${isActive('underline')
                    ? 'bg-indigo-500/30 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                title="Underline (Ctrl+U)"
            >
                <Underline className="w-4 h-4" />
            </button>
        </div>
    );
}

export default FloatingStyleMenu;
