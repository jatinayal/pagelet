/**
 * Block Model
 * ===========
 * 
 * Represents a content block within a page.
 * 
 * Block Types (MVP):
 * - paragraph: Basic text content
 * - heading1, heading2, heading3: Headings with levels
 * - todo: Checkbox item with checked state
 * - code: Code block with optional language
 * 
 * Content Field Design
 * --------------------
 * The `content` field uses Mixed type (Schema.Types.Mixed) to allow
 * flexible, type-specific data without schema changes:
 * 
 * - Paragraph: { text: "Hello world" }
 * - Heading:   { text: "My Title" }
 * - Todo:      { text: "Buy milk", checked: false }
 * - Code:      { code: "console.log('hi')", language: "javascript" }
 * 
 * This design supports:
 * 1. Adding new block types without migrations
 * 2. Storing rich content (marks, attributes) for TipTap
 * 3. Efficient auto-save (update only changed content)
 * 
 * TipTap Integration Path
 * -----------------------
 * When integrating TipTap, the content field can store:
 * - TipTap's JSON document format
 * - Or HTML string (simpler but less flexible)
 * 
 * Example TipTap content:
 * {
 *   type: 'doc',
 *   content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
 * }
 * 
 * The backend doesn't need to understand TipTap's format—it just
 * stores and retrieves the JSON. The frontend handles rendering.
 */

import mongoose from 'mongoose';

/**
 * Allowed block types for validation.
 * Extend this list when adding new block types.
 * 
 * 'page' type: A reference to a child page. Stored as:
 * content: { pageId: ObjectId, title: string }
 */
const BLOCK_TYPES = ['paragraph', 'heading1', 'heading2', 'heading3', 'todo', 'code', 'page', 'quote', 'image', 'link'];

const blockSchema = new mongoose.Schema(
    {
        pageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Page',
            required: [true, 'Page ID is required'],
            index: true, // Index for fetching blocks by page
        },
        type: {
            type: String,
            required: [true, 'Block type is required'],
            enum: {
                values: BLOCK_TYPES,
                message: 'Invalid block type: {VALUE}',
            },
            default: 'paragraph',
        },
        order: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Order cannot be negative'],
        },
        /**
         * Flexible content field - structure depends on block type.
         * 
         * MVP structures:
         * - paragraph: { text: string }
         * - heading1/2/3: { text: string }
         * - todo: { text: string, checked: boolean }
         * - code: { code: string, language?: string }
         * 
         * The Mixed type allows any JSON structure, making it easy to
         * extend for TipTap's rich content format later.
         */
        content: {
            type: mongoose.Schema.Types.Mixed,
            default: () => ({ text: '' }),
        },
        /**
         * Block background color for visual distinction.
         * Stored as hex color (e.g., '#ffd54f').
         * null = transparent (default, no background).
         * 
         * Colors are rendered with reduced opacity (10-15%) in the UI
         * to maintain readability and avoid harsh visuals.
         */
        backgroundColor: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Compound index for fetching blocks of a page in order.
 * Optimizes the common "load page with blocks" query.
 */
blockSchema.index({ pageId: 1, order: 1 });

/**
 * Remove internal fields when converting to JSON.
 */
blockSchema.methods.toJSON = function () {
    const block = this.toObject();
    delete block.__v;
    return block;
};

/**
 * Static method to get the next order number for a page.
 * Used when creating new blocks to append at the end.
 */
blockSchema.statics.getNextOrder = async function (pageId) {
    const lastBlock = await this.findOne({ pageId })
        .sort({ order: -1 })
        .select('order')
        .lean();

    return lastBlock ? lastBlock.order + 1 : 0;
};

/**
 * Static method to delete all blocks for a page.
 * Used when deleting a page (cascade delete).
 */
blockSchema.statics.deleteByPageId = async function (pageId) {
    return this.deleteMany({ pageId });
};

// Prevent model recompilation in development (hot reload)
const Block = mongoose.models.Block || mongoose.model('Block', blockSchema);

export default Block;
