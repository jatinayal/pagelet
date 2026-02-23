/**
 * AI Action Handler
 * =================
 * 
 * Central handler for processing structured JSON responses from Gemini.
 * Executes actions (create/update/delete blocks) via the API client.
 */

import * as api from './apiClient';

/**
 * Handles the AI result, executes actions, and returns the final response message.
 * 
 * @param {object} aiResult - The structured JSON from Gemini { intent, actions, response }
 * @param {object} context - { pageId, refreshPage, router }
 * @returns {Promise<string>} - The final message to display to the user
 */
export async function handleAIResult(aiResult, context) {
    const { intent, actions = [], response } = aiResult;
    const { pageId, refreshBlocks } = context;

    console.log('🤖 Handling AI Result:', { intent, actionsCount: actions.length });

    // 1. Execute Actions Sequentially
    try {
        for (const action of actions) {
            console.log('⚡ Executing Action:', action.type);
            await executeAction(action, pageId);
        }

        // Refresh UI if actions were executed
        if (actions.length > 0 && refreshBlocks) {
            await refreshBlocks();
        }

    } catch (error) {
        console.error('❌ Action Execution Failed:', error);
        return "I tried to help, but something went wrong while applying the changes. 😔";
    }

    // 2. Response Normalization
    // If actions occurred but response is empty, provide a default success message.
    if (actions.length > 0 && (!response || response.trim() === "")) {
        return generateDefaultSuccessMessage(intent);
    }

    // Return the AI's response (or a fallback if absolutely nothing exists)
    return response || "Done.";
}

/**
 * Routes individual actions to specific API calls.
 */
async function executeAction(action, pageId) {
    switch (action.type) {
        case 'insert_blocks':
            await handleInsertBlocks(action, pageId);
            break;
        case 'update_block':
            await handleUpdateBlock(action);
            break;
        case 'delete_block':
            await handleDeleteBlock(action);
            break;
        case 'create_page':
            await handleCreatePage(action, pageId);
            break;
        default:
            console.warn('⚠️ Unknown action type:', action.type);
    }
}

// --- Action Helpers ---

async function handleInsertBlocks(action, pageId) {
    const { blocks, afterBlockId } = action;
    if (!blocks || !Array.isArray(blocks)) return;

    // Create blocks sequentially to maintain order if API doesn't support batch
    // (Our current API is one-by-one, ideally we'd have a batch endpoint but loop is fine for now)
    for (const block of blocks) {
        let content = block.content;

        // Normalize AI block inputs for link blocks
        // The AI might put url/text at the top level instead of in content
        if (block.type === 'link') {
            if (typeof content === 'string') {
                content = { text: content, url: content };
            } else {
                content = content || {};
                content.url = content.url || block.url || '';
                content.text = content.text || block.text || content.url || 'Link';
            }
        }

        await api.createBlock(pageId, block.type, content);
        // Note: 'order' might need handling if the API doesn't auto-append correctly 
        // or if we need to insert at a specific position. 
        // For now, simple append is safest unless we engineer a complex insert-at logic.
    }
}

async function handleUpdateBlock(action) {
    const { id, updates } = action;
    if (!id || !updates) return;

    // Normalize updates for link blocks
    if (updates.type === 'link' || updates.url || updates.text || (updates.content && updates.content.url)) {
        if (!updates.content) updates.content = {};
        if (typeof updates.content === 'string') {
            updates.content = { text: updates.content, url: updates.content };
        }

        updates.content.url = updates.content.url || updates.url || '';
        updates.content.text = updates.content.text || updates.text || updates.content.url || 'Link';

        // Remove top level properties so they don't pollute the block schema root
        delete updates.url;
        delete updates.text;
    }

    await api.updateBlock(id, updates);
}

async function handleDeleteBlock(action) {
    const { id } = action;
    if (!id) return;
    await api.deleteBlock(id);
}

async function handleCreatePage(action, parentPageId) {
    const { title } = action;
    await api.createPageBlock(parentPageId, null, title || "Untitled Page");
}

// --- Utils ---

function generateDefaultSuccessMessage(intent) {
    switch (intent) {
        case 'create_block': return "I've added that for you.";
        case 'update_block': return "Updated.";
        case 'delete_block': return "Deleted.";
        default: return "Task completed successfully.";
    }
}
