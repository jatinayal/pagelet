/**
 * SaveStatus Component
 * ====================
 * 
 * Displays auto-save status with subtle visual feedback.
 * 
 * UX Decision: Use minimal text and icons to avoid distraction.
 * "Saving..." appears briefly, then fades to "Saved" with checkmark.
 */

'use client';

import { Check, Loader2 } from 'lucide-react';

export function SaveStatus({ saving = false, className = '' }) {
    return (
        <div className={`flex items-center gap-1.5 text-xs ${className}`}>
            {saving ? (
                <>
                    <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
                    <span className="text-yellow-500">Saving...</span>
                </>
            ) : (
                <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-gray-500">Saved</span>
                </>
            )}
        </div>
    );
}

export default SaveStatus;
