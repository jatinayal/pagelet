/**
 * TextBlock Component
 * ===================
 * 
 * Core text editing component with LIVE style preview.
 * 
 * Architecture: Overlay Pattern
 * -----------------------------
 * To show styled text while editing (without contenteditable), we use:
 * 1. Hidden textarea for input capture (transparent text)
 * 2. Visible overlay div with RichText for styled display
 * 3. Perfect position sync between the two
 * 
 * This gives Notion-like experience:
 * - Typing updates state immediately
 * - Styles are visible in real-time
 * - All mutations go through React state (not DOM)
 * 
 * Style Marks Architecture
 * ------------------------
 * Styles are stored as an array of mark objects:
 *   marks: [{ type: 'bold', start: 5, end: 10 }, ...]
 * 
 * When text is edited, marks are automatically adjusted:
 * - Insertion: Marks after insertion point shift forward
 * - Deletion: Marks shrink or are removed if collapsed
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { RichText } from '../common/RichText';
import { FloatingStyleMenu } from '../common/FloatingStyleMenu';
import { applyMark, removeMark, adjustMarks } from '@/utils/textStyles';

export function TextBlock({ block, onChange, onKeyDown, autoFocus, placeholder, className, readOnly }) {
    const textareaRef = useRef(null);
    const [isEditing, setIsEditing] = useState(autoFocus || false);
    const [localSelection, setLocalSelection] = useState({ start: 0, end: 0 });

    // Derived state
    const text = block.content?.text || '';
    const marks = block.content?.marks || [];

    // Focus handling
    useEffect(() => {
        if ((autoFocus || isEditing) && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end only on initial focus
            if (autoFocus) {
                const len = textareaRef.current.value.length;
                textareaRef.current.setSelectionRange(len, len);
            }
        }
    }, [autoFocus, isEditing]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea && isEditing) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [text, isEditing]);

    // Handle text changes + mark adjustment - IMMEDIATE state update
    const handleChange = (e) => {
        const newText = e.target.value;
        const delta = newText.length - text.length;
        const cursor = e.target.selectionStart;
        const changeIndex = delta > 0 ? cursor - delta : cursor;

        // Adjust existing marks immediately
        const newMarks = adjustMarks(marks, changeIndex, delta);

        // Dispatch state update immediately (no debounce on state, only on save)
        onChange({
            ...block.content,
            text: newText,
            marks: newMarks
        });
    };

    // Handle style changes from floating menu - IMMEDIATE update
    const handleStyleChange = useCallback((newMarks) => {
        // Immediately update state - this triggers re-render and autosave
        onChange({
            ...block.content,
            marks: newMarks
        });

        // Restore focus after style update
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(localSelection.start, localSelection.end);
            }
        });
    }, [block.content, onChange, localSelection]);

    // Track selection for style menu
    const handleSelect = (e) => {
        setLocalSelection({
            start: e.target.selectionStart,
            end: e.target.selectionEnd
        });
    };

    // Handle keyboard shortcuts - IMMEDIATE update
    const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (['b', 'i', 'u'].includes(key)) {
                e.preventDefault();
                const type = key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'underline';

                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;

                if (start === end) return;

                const isStyled = marks.some(m =>
                    m.type === type && m.start <= start && m.end >= end
                );

                const newMarks = isStyled
                    ? removeMark(marks, type, start, end)
                    : applyMark(marks, type, start, end);

                // Immediate state update
                onChange({
                    ...block.content,
                    marks: newMarks
                });
                return;
            }
        }

        onKeyDown?.(e, block);
    };

    // Click to enter edit mode
    const handleClick = () => setIsEditing(true);
    const handleBlur = (e) => {
        // Don't blur if clicking the style menu
        if (e.relatedTarget?.closest('[data-style-menu]')) return;
        setIsEditing(false);
    };

    // View Mode or Read-Only Mode
    if ((!isEditing && !autoFocus) || readOnly) {
        return (
            <div
                onClick={!readOnly ? handleClick : undefined}
                className={`min-h-7 py-1.5 outline-none text-base leading-relaxed break-all whitespace-pre-wrap 
                    ${!readOnly ? 'cursor-text' : ''} ${className || ''}`}
                style={{ color: 'var(--color-text-primary)' }}
            >
                {text ? (
                    <RichText text={text} marks={marks} />
                ) : (
                    // Always show placeholder in edit mode (when empty), but NOT in read-only
                    !readOnly && (
                        <span style={{ color: 'var(--color-text-muted)' }} className="italic select-none">
                            {placeholder || 'Type / for commands'}
                        </span>
                    )
                )}
            </div>
        );
    }

    // Edit Mode: Overlay pattern - invisible textarea + visible styled text
    return (
        <div className="relative">
            {/* Visible Layer: Styled text overlay */}
            <div
                className={`min-h-7 py-1.5 text-base leading-relaxed break-all whitespace-pre-wrap pointer-events-none ${className || ''}`}
                style={{ color: 'var(--color-text-primary)' }}
                aria-hidden="true"
            >
                {text ? (
                    <RichText text={text} marks={marks} />
                ) : (
                    <span style={{ color: 'var(--color-text-muted)' }} className="italic">{placeholder || 'Type / for commands'}</span>
                )}
            </div>

            {/* Input Layer: Transparent textarea for input capture */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onSelect={handleSelect}
                onMouseUp={handleSelect}
                autoFocus={autoFocus || isEditing}
                placeholder=""
                className={`absolute inset-0 w-full h-full bg-transparent resize-none overflow-hidden 
                           outline-none text-transparent selection:bg-lavender/30
                           min-h-7 py-1.5 ${className || ''}`}
                style={{ caretColor: 'var(--color-lavender, #E4C1F9)' }}
                rows={1}
            />

            {/* Floating Style Menu - appears on text selection */}
            <FloatingStyleMenu
                targetRef={textareaRef}
                marks={marks}
                onStyleChange={handleStyleChange}
                applyMark={applyMark}
                removeMark={removeMark}
            />
        </div>
    );
}

export default TextBlock;
