import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Download, AlertCircle } from 'lucide-react';

export default function ImportModal({ isOpen, onClose, onImport, currentPageId }) {
    const [url, setUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);

    // Basic regex to test if it's a URL and specifically the structure of our public pages
    const validateAndExtractId = (inputUrl) => {
        try {
            const parsedUrl = new URL(inputUrl);
            const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

            // Expected format: /public/[pageId]
            if (pathParts.length >= 2 && pathParts[0] === 'public') {
                return pathParts[1];
            }
            return null;
        } catch {
            return null;
        }
    };

    const handleImport = async () => {
        setError(null);

        if (!url.trim()) {
            setError("Please enter a URL.");
            return;
        }

        const extractedId = validateAndExtractId(url.trim());

        if (!extractedId) {
            setError("Invalid URL format. Expected: https://.../public/...");
            return;
        }

        if (extractedId === currentPageId) {
            setError("You cannot import content from the same page.");
            return;
        }

        setIsImporting(true);
        try {
            await onImport(extractedId);
            // If completely successful, clear the state for next time
            setUrl('');
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to import blocks.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Invisible Backdrop to catch clicks outside menu */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={!isImporting ? onClose : undefined}
                    />

                    {/* Popover Menu Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                        className="absolute right-0 top-full mt-3 z-50 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl w-80 p-4 overflow-hidden"
                        style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)' }}
                    >
                        {/* Header */}
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            Import Blocks
                        </h3>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                            Paste the public page URL below to import its blocks into this page.
                        </p>

                        {/* Input Field */}
                        <div className="space-y-3">
                            <div>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="https://.../public/abcdef123"
                                    disabled={isImporting}
                                    className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all disabled:opacity-50"
                                />
                            </div>

                            {/* Subtext info */}
                            <p className="text-[11px] text-gray-400">
                                Only pages with 50 blocks or fewer will be fully imported.
                            </p>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-start gap-1.5 text-xs text-red-500 bg-red-50/50 border border-red-100 p-2 rounded-lg overflow-hidden"
                                    >
                                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Importing Progress state underneath */}
                            <AnimatePresence>
                                {isImporting && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                                            <motion.div
                                                initial={{ x: '-100%' }}
                                                animate={{ x: '100%' }}
                                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                className="h-full w-1/2 bg-indigo-400 rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex flex-col gap-1.5 pt-1">
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting || !url.trim() || !!error}
                                    className={`cursor-pointer w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all
                                        ${isImporting || !url.trim() || !!error
                                            ? 'bg-indigo-50 text-indigo-300 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95'}`}
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Importing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Import</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={onClose}
                                    disabled={isImporting}
                                    className="w-full cursor-pointer px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 font-medium rounded-lg transition-colors text-center disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
