/**
 * QuoteBlock Component
 * ====================
 * 
 * Renders a quote block with visual quotation marks and accent line.
 * 
 * Design Decision: Quotation Marks at UI Level
 * ---------------------------------------------
 * The quotation marks (" ") are rendered purely in the UI layer and NOT
 * stored in the database. This ensures:
 * 1. Clean data: The backend stores only the actual quote text
 * 2. Flexibility: Visual styling can change without data migration
 * 3. Consistency: All quotes display identically regardless of how entered
 * 4. No duplication: Prevents users from accidentally adding extra quotes
 * 
 * Supports all inline text styles (bold, italic, underline) via RichText.
 */

'use client';

import { TextBlock } from './TextBlock';

export function QuoteBlock({ block, onChange, onKeyDown, autoFocus }) {
    return (
        <div className="flex gap-4 my-2 group">
            {/* Visual Quote Accent Line - lavender accent */}
            <div className="w-1 rounded-full shrink-0 transition-colors"
                style={{ background: 'rgba(228, 193, 249, 0.5)' }} />

            <div className="flex-1 relative">
                {/* Opening Quote Mark - UI only, not stored */}
                <span
                    className="absolute -left-2 -top-2 text-4xl font-serif select-none pointer-events-none"
                    style={{ color: 'rgba(109, 40, 217, 0.50)' }}
                    aria-hidden="true"
                >
                    "
                </span>

                {/* Quote Content with TextBlock (supports inline styling) */}
                <div className="pl-4 pr-2">
                    <TextBlock
                        block={block}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        autoFocus={autoFocus}
                        placeholder="Empty quote..."
                        className="italic text-lg"
                    />
                </div>

                {/* Closing Quote Mark - UI only, not stored */}
                <span
                    className="absolute -right-1 -bottom-4 text-4xl font-serif select-none pointer-events-none"
                    style={{ color: 'rgba(109, 40, 217, 0.50)' }}
                    aria-hidden="true"
                >
                    "
                </span>
            </div>
        </div>
    );
}

export default QuoteBlock;
