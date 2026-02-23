/**
 * DeleteConfirmMenu Component
 * ===========================
 * 
 * Reusable confirmation popover for delete actions.
 * Replaces window.confirm with a custom glassmorphism menu.
 * 
 * Features:
 * - Floating popover positioned relative to trigger
 * - Glassmorphism theme (backdrop blur, white/translucent bg)
 * - Click outside to close
 * - Smooth fade/scale animations
 * - Customizable trigger (can wrap any button/icon)
 * - Uses React Portals to break out of overflow:hidden containers
 * - Auto-flips and shifts to remain in viewport
 */

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteConfirmMenu({
    onDelete,
    trigger,
    title = "Delete page?",
    description,
    side = "right", // 'right', 'left', 'bottom', 'bottom-left'
    className = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    // ✅ Calculate Position (Fixed-based)
    const updatePosition = () => {
        if (!triggerRef.current || !menuRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();

        let top = triggerRect.top;
        let left = triggerRect.left;

        // Base placement
        switch (side) {
            case "right":
                top += triggerRect.height / 2 - menuRect.height / 2;
                left += triggerRect.width + 8;
                break;

            case "left":
                top += triggerRect.height / 2 - menuRect.height / 2;
                left -= menuRect.width + 8;
                break;

            case "bottom":
                top += triggerRect.height + 8;
                left += triggerRect.width - menuRect.width;
                break;

            case "bottom-left":
                top += triggerRect.height + 8;
                break;

            default:
                top += triggerRect.height + 8;
                left += triggerRect.width - menuRect.width;
        }

        // Viewport boundaries
        const padding = 12;

        // Horizontal clamp
        if (left + menuRect.width > window.innerWidth - padding) {
            left = window.innerWidth - menuRect.width - padding;
        }

        if (left < padding) {
            left = padding;
        }

        // Vertical flip if overflow bottom
        if (top + menuRect.height > window.innerHeight - padding) {
            top = triggerRect.top - menuRect.height - 8;
        }

        // Clamp top if overflow top
        if (top < padding) {
            top = padding;
        }

        setPosition({ top, left });
    };

    // ✅ Open / Close
    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    const handleConfirm = (e) => {
        e.stopPropagation();
        onDelete();
        setIsOpen(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setIsOpen(false);
    };

    // ✅ Position BEFORE paint (prevents flicker)
    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen, side]);

    // ✅ Outside click + resize + scroll handling
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleResizeOrScroll = () => {
            updatePosition();
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleResizeOrScroll);
        window.addEventListener("scroll", handleResizeOrScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleResizeOrScroll);
            window.removeEventListener("scroll", handleResizeOrScroll, true);
        };
    }, [isOpen]);

    return (
        <>
            {/* Trigger */}
            <div
                ref={triggerRef}
                onClick={toggleMenu}
                className={`cursor-pointer inline-flex ${className}`}
            >
                {trigger || (
                    <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Portal Menu */}
            {isOpen &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: "fixed", // ✅ important
                            top: position.top,
                            left: position.left,
                        }}
                        className="z-[9999] flex flex-col gap-2 p-3 bg-white/95 backdrop-blur-xl
                       border border-red-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                       min-w-[200px] w-max max-w-[300px]
                       animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Content */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-50 rounded-lg shrink-0">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-0.5">
                                    {title}
                                </h4>

                                {description && (
                                    <p className="text-xs text-gray-500 leading-relaxed mb-2">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-1">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-3 py-1.5 text-xs cursor-pointer font-medium text-gray-600 
                           bg-gray-50 hover:bg-gray-100 rounded-lg 
                           transition-colors border border-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-3 py-1.5 text-xs  cursor-pointer font-medium text-white 
                           bg-red-500 hover:bg-red-600 rounded-lg 
                           transition-colors shadow-sm shadow-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
