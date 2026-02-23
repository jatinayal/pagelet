'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

export function ChatWidget({ pageContext = {}, onExecuteActions }) {
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm Pebble, your AI assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false); // AI thinking state

    // Predefined suggestion prompts
    const SUGGESTIONS = [
        "Summarize",
        "Explain",
        "Create a new page",
        "Add a  new block",
        "Modify block content",
        "Delete a block",
        "Change block type",
        "Change block position",
    ];

    // Draggable state
    const position = useRef({ x: 0, y: 0 });
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Scroll to bottom
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Initial position & Window Safety
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        // Initial pos
        if (position.current.x === 0 && position.current.y === 0) {
            position.current = {
                x: window.innerWidth - 100,
                y: window.innerHeight - 100
            };
            setDragPosition({ ...position.current });
        }

        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e) => {
        if (isOpen) return;

        // Prevent default to avoid text selection etc
        // e.preventDefault(); // Optional, might block button click? Button click needs to work.
        // Don't prevent default on the wrapper if we want the button inside to receive clicks.
        // But we are on the wrapper div.

        isDragging.current = true;
        dragStart.current = {
            x: e.clientX - position.current.x,
            y: e.clientY - position.current.y
        };

        // Attach global listeners
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;

        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;

        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;

        position.current = {
            x: Math.min(Math.max(0, newX), maxX),
            y: Math.min(Math.max(0, newY), maxY)
        };

        setDragPosition({ ...position.current });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        // Clean up global listeners
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    // Clean up on unmount just in case
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);


    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    pageContext: {
                        title: pageContext.title,
                        blocks: pageContext.blocks?.map(b => ({
                            _id: b._id,
                            type: b.type,
                            content: b.content,
                            order: b.order,
                            backgroundColor: b.backgroundColor,
                            // Only send essential fields to save tokens
                        }))
                    }
                }),
            });

            const data = await res.json();

            if (data) {
                // Delegate execution and message generation to the handler
                if (onExecuteActions) {
                    try {
                        const finalMessage = await onExecuteActions(data);
                        const aiMsg = { id: Date.now() + 1, text: finalMessage, sender: 'ai' };
                        setMessages(prev => [...prev, aiMsg]);
                    } catch (e) {
                        console.error('Action execution failed:', e);
                        const errorMsg = { id: Date.now() + 1, text: "Something went wrong while applying changes.", sender: 'ai' };
                        setMessages(prev => [...prev, errorMsg]);
                    }
                } else {
                    // Fallback if no handler provided
                    const aiMsg = { id: Date.now() + 1, text: data.response || "Done.", sender: 'ai' };
                    setMessages(prev => [...prev, aiMsg]);
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = { id: Date.now() + 1, text: "Network error.", sender: 'ai' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputText(suggestion);
        document.getElementById('chat-input')?.focus();
    };

    // Calculate tooltip position based on quadrant
    const isLeft = dragPosition.x < windowSize.width / 2;
    const isTop = dragPosition.y < windowSize.height / 2;

    // TL: Top-Left Widget -> Bubble Bottom-Right
    // TR: Top-Right Widget -> Bubble Bottom-Left
    // BL: Bottom-Left Widget -> Bubble Top-Right
    // BR: Bottom-Right Widget -> Bubble Top-Left

    const getTooltipClasses = () => {
        const baseClasses = "absolute px-4 py-2 bg-white rounded-2xl shadow-lg border border-purple-100 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap group-hover:opacity-100 group-hover:scale-100";
        const hiddenClasses = "opacity-0 scale-75";

        if (isTop && isLeft) {
            // Widget at Top-Left -> Bubble at Bottom-Right
            return {
                container: `${baseClasses} ${hiddenClasses} top-full left-full mt-2 ml-2 origin-top-left rounded-tl-none group-hover:translate-x-0 group-hover:translate-y-0 translate-x-3 translate-y-3`,
                dots: "top-0 left-0 -mt-1.5 -ml-1.5",
                dots2: "top-1 left-1 -mt-3 -ml-3"
            };
        } else if (isTop && !isLeft) {
            // Widget at Top-Right -> Bubble at Bottom-Left
            return {
                container: `${baseClasses} ${hiddenClasses} top-full right-full mt-2 mr-2 origin-top-right rounded-tr-none group-hover:translate-x-0 group-hover:translate-y-0 -translate-x-3 translate-y-3`,
                dots: "top-0 right-0 -mt-1.5 -mr-1.5",
                dots2: "top-1 right-1 -mt-3 -mr-3"
            };
        } else if (!isTop && isLeft) {
            // Widget at Bottom-Left -> Bubble at Top-Right
            return {
                container: `${baseClasses} ${hiddenClasses} bottom-full left-full mb-2 ml-2 origin-bottom-left rounded-bl-none group-hover:translate-x-0 group-hover:translate-y-0 translate-x-3 -translate-y-3`,
                dots: "bottom-0 left-0 -mb-1.5 -ml-1.5",
                dots2: "bottom-1 left-1 -mb-3 -ml-3"
            };
        } else {
            // Widget at Bottom-Right -> Bubble at Top-Left (Default)
            return {
                container: `${baseClasses} ${hiddenClasses} bottom-full right-full mb-2 mr-2 origin-bottom-right rounded-br-none group-hover:translate-x-0 group-hover:translate-y-0 -translate-x-3 -translate-y-3`,
                dots: "bottom-0 right-0 -mb-1.5 -mr-1.5",
                dots2: "bottom-1 right-1 -mb-3 -mr-3"
            };
        }
    };

    const tooltipStyle = getTooltipClasses();

    // Calculate panel position (left/top based on widget)
    // We need these for the chat window position
    const panelLeft = windowSize.width > 0
        ? Math.min(Math.max(20, dragPosition.x - 300), windowSize.width - 380)
        : 0;

    const panelTop = windowSize.height > 0
        ? Math.min(Math.max(20, dragPosition.y - 500), windowSize.height - 540)
        : 0;

    if (!isMounted) return null;

    return (
        <>
            {/* Draggable Widget Button */}
            <div
                className={`fixed z-50 transition-transform duration-200 ease-out group
                           ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                style={{ left: dragPosition.x, top: dragPosition.y }}
                onMouseDown={handleMouseDown}
            >
                {/* Thought Bubble Tooltip */}
                <div className={tooltipStyle.container}>
                    <span className="text-sm font-medium text-gray-700">Ask Pebble ✨</span>
                    {/* Small thought bubble circles - Position depends on quadrant */}
                    {/* Circle 1 (Closer to bubble) */}
                    <div className={`absolute w-2 h-2 bg-white rounded-full ${tooltipStyle.dots}`}></div>
                    {/* Circle 2 (Closer to widget head) */}
                    <div className={`absolute w-1.5 h-1.5 bg-white rounded-full ${tooltipStyle.dots2}`}></div>
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center
                              transition-all duration-300 ease-out cursor-pointer
                              ${isOpen ? 'scale-95' : 'hover:scale-105'}`}
                    style={{
                        background: `url('/widget.png') bottom/90% no-repeat`,
                        backgroundColor: 'white', // fallback
                        boxShadow: '0 8px 32px rgba(228, 193, 249, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    {/* Image is handled by background */}
                </button>
            </div>

            {/* Chat Panel */}
            <div
                className={`fixed z-50 flex flex-col transition-all duration-300 ease-in-out origin-bottom-right
                           rounded-2xl overflow-hidden
                           ${isOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none translate-y-4'}`}
                style={{
                    width: '360px',
                    height: '520px',
                    left: panelLeft,
                    top: panelTop,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.08)' }}>
                    <div className="flex items-center gap-3">
                        <img src="/frog3.png" alt="AI" className="w-8 h-8 object-contain scale-150" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">Pebble AI</h3>
                            <p className="text-xs text-gray-500">Always here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 cursor-pointer border border-gray-400/20 rounded-full text-gray-400 hover:text-gray-600  transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
                    {messages.length <= 1 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(s)}
                                        className="text-xs cursor-pointer bg-white/50 hover:bg-purple-200/50  border border-purple-200/50 
                                                   px-3 py-1.5 rounded-full text-gray-600 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                          ${msg.sender === 'user' ? 'rounded-br-md text-white' : 'rounded-bl-md text-gray-800'}`}
                                style={{
                                    background: msg.sender === 'user'
                                        ? 'linear-gradient(135deg, #E4C1F9, #A9DEF9)'
                                        : 'rgba(255,255,255,0.6)',
                                    border: msg.sender !== 'user' ? '1px solid rgba(255,255,255,0.5)' : 'none'
                                }}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white/60 border border-white/50 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4" style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-2 bg-gray-50/50 border border-gray-200/60 rounded-xl px-2 py-1.5"
                    >
                        <input
                            id="chat-input"
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask Pebble..."
                            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            className={`p-2 rounded-lg transition-all duration-200
                                      ${inputText.trim()
                                    ? 'opacity-100 hover:bg-purple-100/50'
                                    : 'opacity-40 cursor-not-allowed'}`}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #E4C1F9, #A9DEF9)' }}>
                                <Send className="w-4 h-4 text-white" />
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ChatWidget;
