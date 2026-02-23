/**
 * TodoBlock Component
 * ===================
 * 
 * Checkbox item with text.
 * 
 * UX Decisions:
 * - Checkbox is immediately clickable
 * - Completed items show strikethrough
 * - Muted styling for completed items reduces visual noise
 */

'use client';

import { Square, CheckSquare } from 'lucide-react';
import { TextBlock } from './TextBlock';

export function TodoBlock({ block, onChange, onKeyDown, autoFocus, readOnly }) {


    const handleCheckChange = () => {
        if (readOnly) return;
        onChange({
            ...block.content,
            checked: !block.content?.checked,
        });
    };

    const isChecked = block.content?.checked || false;

    return (
        <div className="flex items-start gap-3 py-1">
            {/* Custom checkbox using Lucide icons */}
            <button
                onClick={handleCheckChange}
                disabled={readOnly}
                className={`mt-2.5 transition-colors 
                    ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer hover:text-indigo-400'}
                    ${isChecked ? 'text-indigo-500' : 'text-gray-400'}
                `}
            >
                {isChecked ? (
                    <CheckSquare className="w-5 h-5" />
                ) : (
                    <Square className="w-5 h-5" />
                )}
            </button>

            <div className={`flex-1 ${isChecked ? 'line-through text-gray-500' : ''}`}>
                <TextBlock
                    block={block}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    autoFocus={autoFocus}
                    placeholder="To-do..."
                    className={isChecked ? 'text-gray-500' : ''}
                    readOnly={readOnly}
                />
            </div>
        </div>
    );
}

export default TodoBlock;
