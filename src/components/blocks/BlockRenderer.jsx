/**
 * BlockRenderer Component
 * =======================
 * 
 * The abstraction layer between the editor and individual block components.
 * Switches UI based on block.type.
 * 
 * Design Decision: PageBlock is treated the same as other blocks.
 * No special-case logic leaks into the editor - just another switch case.
 */

'use client';

import TextBlock from './TextBlock';
import HeadingBlock from './HeadingBlock';
import TodoBlock from './TodoBlock';
import CodeBlock from './CodeBlock';
import PageBlock from './PageBlock';
import QuoteBlock from './QuoteBlock';
import ImageBlock from './ImageBlock';
import LinkBlock from './LinkBlock';

export function BlockRenderer({ block, onChange, onKeyDown, autoFocus, onPageClick, onPageDelete, readOnly = false }) {
    const sharedProps = {
        block,
        onChange,
        onKeyDown,
        autoFocus,
        readOnly, // Pass readOnly to all blocks
    };

    switch (block.type) {
        case 'paragraph':
            return <TextBlock {...sharedProps} />;

        case 'heading1':
        case 'heading2':
        case 'heading3':
            return <HeadingBlock {...sharedProps} />;

        case 'todo':
            return <TodoBlock {...sharedProps} />;

        case 'code':
            return <CodeBlock {...sharedProps} />;

        case 'quote':
            return <QuoteBlock {...sharedProps} />;

        case 'image':
            return <ImageBlock {...sharedProps} />;

        case 'link':
            return <LinkBlock {...sharedProps} />;

        case 'page':
            // PageBlock needs click and delete handlers
            // In readOnly mode, disable delete and ensure click works for navigation
            return <PageBlock
                block={block}
                onClick={onPageClick}
                onDelete={readOnly ? null : onPageDelete}
                readOnly={readOnly}
            />;

        default:
            console.warn(`Unknown block type: ${block.type}`);
            return <TextBlock {...sharedProps} />;
    }
}

export default BlockRenderer;
