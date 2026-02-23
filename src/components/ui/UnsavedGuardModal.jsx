import { motion, AnimatePresence } from 'framer-motion';

export default function UnsavedGuardModal({ isOpen, onDiscardAndContinue, onCancel }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Invisible Backdrop to catch clicks outside menu */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={onCancel}
                    />

                    {/* Popover Menu Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                        className="absolute right-0 top-full mt-3 z-50 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl w-64 p-4 overflow-hidden"
                        style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)' }}
                    >
                        {/* Header */}
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            Unsaved changes
                        </h3>

                        {/* Body */}
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            You have unsaved changes on this page. Discard them to continue?
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5">
                            <button
                                onClick={onDiscardAndContinue}
                                className="w-full cursor-pointer px-3 py-2 text-xs text-orange-600 hover:bg-orange-50 font-medium rounded-lg transition-colors text-center"
                            >
                                Discard & Continue
                            </button>

                            <button
                                onClick={onCancel}
                                className="w-full cursor-pointer px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 font-medium rounded-lg transition-colors text-center"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
