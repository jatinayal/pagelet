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

import { useRef, useEffect, useState, useCallback, startTransition } from 'react';
import { RichText } from '../common/RichText';
import { FloatingStyleMenu } from '../common/FloatingStyleMenu';
import { applyMark, removeMark, adjustMarksForChange } from '@/utils/textStyles';

const FONT_VARIABLES = {
    modern: 'var(--font-modern, sans-serif)',
    serif: 'var(--font-serif, serif)',
    mono: 'var(--font-mono, monospace)',
    cursive: 'var(--font-cursive, cursive)',
    royal: 'var(--font-royal, serif)'
};

export function TextBlock({ block, onChange, onKeyDown, autoFocus, placeholder, className, readOnly }) {
    const textareaRef = useRef(null);
    const [isEditing, setIsEditing] = useState(autoFocus || false);
    const [localSelection, setLocalSelection] = useState({ start: 0, end: 0 });

    // Local state for instantaneous typing feedback
    const [localText, setLocalText] = useState(block.content?.text || '');
    const [localMarks, setLocalMarks] = useState(block.content?.marks || []);
    const [localFont, setLocalFont] = useState(block.content?.fontFamily || 'modern');

    // Track parent updates to sync safely without overwriting rapid typing
    const textRef = useRef(block.content?.text || '');
    const fontRef = useRef(block.content?.fontFamily || 'modern');

    // Synchronize local state when backend data changes (e.g. initial load, conversions)
    // ONLY if the incoming text fundamentally differs from local text to prevent cursor jumps mid-typing
    useEffect(() => {
        if (block.content?.text !== textRef.current) {
            setLocalText(block.content?.text || '');
            setLocalMarks(block.content?.marks || []);
            textRef.current = block.content?.text || '';
        }
        if (block.content?.fontFamily !== fontRef.current) {
            setLocalFont(block.content?.fontFamily || 'modern');
            fontRef.current = block.content?.fontFamily || 'modern';
        }
    }, [block.content?.text, block.content?.marks, block.content?.fontFamily]);

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
    }, [localText, isEditing]);

    // Handle text changes + mark adjustment - IMMEDIATE LOCAL state update
    const handleChange = (e) => {
        const newText = e.target.value;

        // Use the new precise mark diff adjuster to handle multi-line pasting gracefully
        const newMarks = adjustMarksForChange(localMarks, localText, newText);

        // Update local state instantly so the UI feels native
        setLocalText(newText);
        setLocalMarks(newMarks);
        textRef.current = newText;

        // Dispatch expensive React propagation via startTransition so it doesn't block the visual paint
        startTransition(() => {
            onChange({
                ...block.content,
                text: newText,
                marks: newMarks,
                fontFamily: localFont
            });
        });
    };

    // Handle style changes from floating menu
    const handleStyleChange = useCallback((newMarks) => {
        setLocalMarks(newMarks);

        startTransition(() => {
            onChange({
                ...block.content,
                text: localText,
                marks: newMarks,
                fontFamily: localFont
            });
        });

        // Restore focus after style update
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(localSelection.start, localSelection.end);
            }
        });
    }, [block.content, onChange, localSelection, localText, localFont]);

    const handleFontChange = (newFont) => {
        setLocalFont(newFont);
        fontRef.current = newFont;
        startTransition(() => {
            onChange({
                ...block.content,
                text: localText,
                marks: localMarks,
                fontFamily: newFont
            });
        });
    };

    // Track selection for style menu
    const handleSelect = (e) => {
        setLocalSelection({
            start: e.target.selectionStart,
            end: e.target.selectionEnd
        });
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        // Explicitly handle Ctrl+Enter for newline injection within the exact same block
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();

            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newText = localText.substring(0, start) + '\n' + localText.substring(end);

            // Adjust markers around the new explicit line break
            const newMarks = adjustMarksForChange(localMarks, localText, newText);

            setLocalText(newText);
            setLocalMarks(newMarks);
            textRef.current = newText;

            // Push changes down pipeline
            startTransition(() => {
                onChange({
                    ...block.content,
                    text: newText,
                    marks: newMarks,
                    fontFamily: localFont
                });
            });

            // Resync caret to line below instantly
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = start + 1;
                    textareaRef.current.selectionEnd = start + 1;
                }
            });

            return;
        }

        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (['b', 'i', 'u'].includes(key)) {
                e.preventDefault();
                const type = key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'underline';

                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;

                if (start === end) return;

                const isStyled = localMarks.some(m =>
                    m.type === type && m.start <= start && m.end >= end
                );

                const newMarks = isStyled
                    ? removeMark(localMarks, type, start, end)
                    : applyMark(localMarks, type, start, end);

                setLocalMarks(newMarks);

                startTransition(() => {
                    onChange({
                        ...block.content,
                        marks: newMarks,
                        fontFamily: localFont
                    });
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

    const activeFontVar = FONT_VARIABLES[localFont] || FONT_VARIABLES.inter;

    // View Mode or Read-Only Mode
    if ((!isEditing && !autoFocus) || readOnly) {
        return (
            <div
                onClick={!readOnly ? handleClick : undefined}
                className={`min-h-7 py-1.5 outline-none text-base leading-relaxed wrap-break-word whitespace-pre-wrap 
                    ${!readOnly ? 'cursor-text' : ''} ${className || ''}`}
                style={{ color: 'var(--color-text-primary)', fontFamily: activeFontVar }}
            >
                {localText ? (
                    <RichText text={localText} marks={localMarks} />
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
                className={`min-h-7 py-1.5 px-0 text-base leading-relaxed wrap-break-word whitespace-pre-wrap pointer-events-none ${className || ''}`}
                style={{ color: 'var(--color-text-primary)', fontFamily: activeFontVar }}
                aria-hidden="true"
            >
                {localText ? (
                    <RichText text={localText} marks={localMarks} />
                ) : (
                    <span style={{ color: 'var(--color-text-muted)' }} className="italic">{placeholder || 'Type / for commands'}</span>
                )}
            </div>

            {/* Input Layer: Transparent textarea for input capture */}
            <textarea
                ref={textareaRef}
                value={localText}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onSelect={handleSelect}
                onMouseUp={handleSelect}
                autoFocus={autoFocus || isEditing}
                placeholder=""
                className={`absolute inset-0 w-full h-full bg-transparent resize-none overflow-hidden 
                           outline-none text-transparent selection:bg-lavender/30 border-none m-0
                           text-base px-0 leading-relaxed wrap-break-word whitespace-pre-wrap
                           min-h-7 py-1.5 ${className || ''}`}
                style={{ caretColor: 'var(--color-text-primary, #1f2937)', fontFamily: activeFontVar }}
                rows={1}
            />

            {/* Floating Style Menu - appears on text selection */}
            <FloatingStyleMenu
                targetRef={textareaRef}
                marks={localMarks}
                onStyleChange={handleStyleChange}
                fontFamily={localFont}
                onFontChange={handleFontChange}
                applyMark={applyMark}
                removeMark={removeMark}
            />
        </div>
    );
}

export default TextBlock;
