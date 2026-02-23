/**
 * HeadingBlock Component
 * ======================
 * 
 * Renders heading blocks (H1, H2, H3).
 */

'use client';

import { TextBlock } from './TextBlock';

const HEADING_STYLES = {
    heading1: 'text-xl font-bold',
    heading2: 'text-lg font-semibold',
    heading3: 'text-md font-medium',
};

const PLACEHOLDERS = {
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
};

export function HeadingBlock({ block, onChange, onKeyDown, autoFocus }) {
    const headingStyle = HEADING_STYLES[block.type] || HEADING_STYLES.heading1;
    const placeholder = PLACEHOLDERS[block.type] || 'Heading';

    return (
        <TextBlock
            block={block}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder}
            className={headingStyle}
        />
    );
}

export default HeadingBlock;
