/**
 * CodeBlock Component - Lightweight Syntax Highlighting
 * ======================================================
 * 
 * WHY THIS APPROACH:
 * ------------------
 * We intentionally avoid heavy editors like Monaco, CodeMirror, or TipTap.
 * Those libraries are 200KB-2MB+ and designed for IDEs, not simple note blocks.
 * They would cause:
 * - Slow page loads (heavy JS bundles)
 * - Memory issues with multiple blocks
 * - Complex state management
 * - Overkill for basic code snippets
 * 
 * INSTEAD, WE USE:
 * - A plain <textarea> for editing (fast, native, zero overhead)
 * - Shiki for syntax highlighting (renders to static HTML, no runtime cost)
 * - Debounced preview updates (don't re-highlight on every keystroke)
 * - CSS overlay technique (textarea is transparent, HTML shows beneath)
 * 
 * RESULT: Multiple code blocks on a page with zero lag.
 */

'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { codeToHtml } from 'shiki';
import { ChevronDown } from 'lucide-react';

// Supported languages with display names
const LANGUAGES = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'json', label: 'JSON' },
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python', label: 'Python' },
    { id: 'plaintext', label: 'Plain Text' },
];

// Debounce hook for preview updates
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export function CodeBlock({ block, onChange, onKeyDown, autoFocus, readOnly }) {
    const textareaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [highlightedHtml, setHighlightedHtml] = useState('');

    // Extract content from block
    const code = block.content?.code || '';
    const language = block.content?.language || 'javascript';

    // Debounce code changes for syntax highlighting (300ms delay)
    // This prevents re-rendering highlights on every keystroke
    const debouncedCode = useDebounce(code, 300);

    // Only highlight when not focused OR after debounce
    // This keeps typing smooth while still showing highlights
    const shouldHighlight = !isFocused || debouncedCode === code;

    // Auto-focus on mount if requested
    useEffect(() => {
        if (autoFocus && textareaRef.current && !readOnly) {
            textareaRef.current.focus();
        }
    }, [autoFocus, readOnly]);

    // Sync textarea height with content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
        }
    }, [code]);

    // Generate syntax-highlighted HTML
    // Uses Shiki with GitHub Dark theme for VS Code-like appearance
    useEffect(() => {
        if (!shouldHighlight) return;

        const highlight = async () => {
            try {
                const html = await codeToHtml(debouncedCode || ' ', {
                    lang: language,
                    theme: 'github-dark',
                });
                setHighlightedHtml(html);
            } catch (err) {
                // Fallback for unsupported languages
                setHighlightedHtml(`<pre><code>${escapeHtml(debouncedCode || ' ')}</code></pre>`);
            }
        };

        highlight();
    }, [debouncedCode, language, shouldHighlight]);

    // Escape HTML for fallback rendering
    const escapeHtml = (str) => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    // Handle code changes
    const handleChange = useCallback((e) => {
        onChange({
            ...block.content,
            code: e.target.value,
        });
    }, [onChange, block.content]);

    // Handle language selection
    const handleLanguageChange = useCallback((langId) => {
        onChange({
            ...block.content,
            language: langId,
        });
        setShowLanguageMenu(false);
    }, [onChange, block.content]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if (readOnly) return;

        // Tab: Insert 2 spaces (don't change focus)
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            const newValue = value.substring(0, start) + '  ' + value.substring(end);

            onChange({
                ...block.content,
                code: newValue,
            });

            // Restore cursor position after state update
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }, 0);
            return;
        }

        // Enter: Preserve indentation from current line
        if (e.key === 'Enter') {
            e.preventDefault();
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const value = textarea.value;

            // Find start of current line and extract indentation
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const line = value.substring(lineStart, start);
            const indent = line.match(/^[\t ]*/)[0];

            const newValue = value.substring(0, start) + '\n' + indent + value.substring(start);

            onChange({
                ...block.content,
                code: newValue,
            });

            // Move cursor after the new indentation
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
            }, 0);
            return;
        }

        // Pass other keys to parent handler
        onKeyDown?.(e, block);
    }, [onChange, onKeyDown, block, readOnly]);

    // Get current language label
    const currentLanguage = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    return (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
            {/* Header bar with language selector */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
                {/* Language dropdown */}
                <div className="relative">
                    <button
                        onClick={() => !readOnly && setShowLanguageMenu(!showLanguageMenu)}
                        disabled={readOnly}
                        className={`flex items-center gap-1.5 text-xs text-gray-400 
                       transition-colors px-2 py-1 rounded
                       ${readOnly ? 'cursor-default' : 'hover:text-gray-200 hover:bg-white/5'}`}
                    >
                        {currentLanguage.label}
                        {!readOnly && <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showLanguageMenu && !readOnly && (
                        <div className="absolute left-0 top-full mt-1 z-20 bg-[#1c2128] border border-white/10 
                            rounded-lg shadow-xl py-1 min-w-[140px]">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => handleLanguageChange(lang.id)}
                                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-white/5 transition-colors
                              ${lang.id === language ? 'text-indigo-400' : 'text-gray-300'}`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* File type indicator */}
                <span className="text-xs text-gray-600">code</span>
            </div>

            {/* Editor container - overlay technique for syntax highlighting */}
            <div
                className="relative font-mono text-sm leading-6"
                onClick={() => !readOnly && textareaRef.current?.focus()}
            >
                {/* 
          SYNTAX HIGHLIGHT LAYER (behind)
        */}
                <div
                    className="absolute inset-0 p-4 overflow-auto pointer-events-none whitespace-pre 
                     [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 
                     [&_code]:!bg-transparent [&_.line]:min-h-[24px]"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                    aria-hidden="true"
                />

                {/* 
          TEXTAREA LAYER (front)
          Hidden in read-only mode to prevent editing/focus, but content still selectable via standard text selection
        */}
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={readOnly ? undefined : handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    readOnly={readOnly}
                    placeholder={readOnly ? "" : "// Write code here..."}
                    spellCheck={false}
                    className={`relative w-full p-4 bg-transparent text-transparent caret-gray-300
                     resize-none overflow-auto outline-none min-h-[100px]
                     selection:bg-indigo-500/30 whitespace-pre
                     ${readOnly ? 'cursor-text resize-none' : ''}`}
                    style={{
                        // Match the highlight layer exactly
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                        lineHeight: '24px',
                        tabSize: 2,
                    }}
                />
            </div>
        </div>
    );
}

export default CodeBlock;
