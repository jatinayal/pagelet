
'use client';

import { useState, useRef, useEffect } from 'react';
import { Link as LinkIcon, ExternalLink, Calculator, X, Check } from 'lucide-react';

export default function LinkBlock({ block, onChange, readOnly }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tempUrl, setTempUrl] = useState(block.content?.url || '');
    const [tempText, setTempText] = useState(block.content?.text || 'Link');

    // Default values
    const url = block.content?.url || '';
    const text = block.content?.text || 'Link';

    const menuRef = useRef(null);
    const containerRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                containerRef.current && !containerRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Initial sync
    useEffect(() => {
        setTempUrl(block.content?.url || '');
        setTempText(block.content?.text || 'Link');
    }, [block.content]);

    const handleSave = () => {
        onChange({
            ...block.content,
            url: tempUrl,
            text: tempText || 'Link'
        });
        setIsMenuOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <div className="relative group my-2">
            {/* The Block Display */}
            <div
                ref={containerRef}
                className={`
                    flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer
                    ${isMenuOpen ? 'bg-indigo-50' : 'hover:bg-gray-100/70'}
                `}
                onClick={() => !readOnly && setIsMenuOpen(!isMenuOpen)}
            >
                <div className="p-1.5 bg-gray-200 rounded text-gray-600">
                    <LinkIcon className="w-4 h-4" />
                </div>

                <a
                    href={url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                        flex-1 text-indigo-600 underline decoration-indigo-300 underline-offset-4
                        ${!url ? 'text-gray-400 no-underline italic' : 'hover:text-indigo-800'}
                    `}
                    onClick={(e) => {
                        // Consumes the click so parent doesn't toggle menu 
                        // IF we have a valid URL. If no URL, let it toggle menu.
                        if (url) {
                            e.stopPropagation();
                        } else {
                            e.preventDefault();
                        }
                    }}
                >
                    {text}
                    {url && <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />}
                </a>
            </div>

            {/* The Lite Menu (Popover) */}
            {isMenuOpen && !readOnly && (
                <div
                    ref={menuRef}
                    className="absolute top-12 left-0 z-20 w-80 bg-white/70 backdrop-blur-sm border border-white/20 
                        rounded-xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="space-y-3">
                        {/* URL Input */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</label>
                            <input
                                type="text"
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="https://example.com"
                                autoFocus
                                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg 
                                    text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                            />
                        </div>

                        {/* Text Input */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Text</label>
                            <input
                                type="text"
                                value={tempText}
                                onChange={(e) => setTempText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Link Name"
                                className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg 
                                    text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="px-3 hover:cursor-pointer py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex hover:cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white 
                                    bg-indigo-500/70 border-pink-400 border hover:bg-indigo-500/70 rounded-lg shadow-sm transition-colors"
                                style={{
                                    color: 'var(--color-text-primary)',
                                    background: 'rgba(228, 193, 249, 0.4)',
                                    border: '1px solid rgba(228, 193, 249, 0.6)',
                                }}
                            >
                                <Check className="w-3 h-3" />
                                Save Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
