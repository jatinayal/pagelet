/**
 * Page Model
 * ==========
 * 
 * Represents a page/document in the note-taking app.
 * 
 * Architecture Decision: Pages as Containers
 * ------------------------------------------
 * Pages are intentionally lightweight containers that hold metadata only.
 * The actual content lives in Block documents (see Block.js).
 * 
 * Why separate Pages and Blocks?
 * 1. **Granular Updates**: Auto-save only updates the changed block,
 *    not the entire page. This reduces payload size and DB writes.
 * 
 * 2. **Block Reordering**: Moving blocks is a simple order update,
 *    not a full document restructure.
 * 
 * 3. **Future Extensibility**: 
 *    - Blocks can have different types (text, heading, todo, image)
 *    - Easy to add block-level features (comments, history)
 *    - Supports collaborative editing per-block
 * 
 * 4. **TipTap Integration**: When migrating to TipTap, each block's
 *    content field can store TipTap's JSON format. The page structure
 *    and block ordering remain unchanged.
 */

import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: 'Untitled',
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        /**
         * Parent Page ID (optional)
         * --------------------------
         * If set, this page is a "child page" nested inside another page.
         * Child pages:
         * - Are NOT shown in the main sidebar
         * - Can only be accessed via their parent page
         * - Support all the same features as normal pages
         * 
         * This enables Notion-style nested pages while keeping the
         * data model flat (no deeply nested documents).
         */
        parentPageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Page',
            default: null,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Index for listing pages by user, sorted by update time.
 * Optimizes the common "show my recent pages" query.
 */
pageSchema.index({ userId: 1, updatedAt: -1 });

/**
 * Remove sensitive/internal fields when converting to JSON.
 */
pageSchema.methods.toJSON = function () {
    const page = this.toObject();
    delete page.__v;
    return page;
};

// Prevent model recompilation in development (hot reload)
const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);

// HOT FIX: Ensure isPublic exists in the schema even if cached
if (Page.schema && !Page.schema.path('isPublic')) {
    Page.schema.add({
        isPublic: {
            type: Boolean,
            default: false,
            index: true,
        }
    });
}

export default Page;
