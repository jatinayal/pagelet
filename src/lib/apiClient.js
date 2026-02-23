/**
 * API Client Utilities
 * ====================
 * 
 * Fetch wrapper for making API calls to the backend.
 * Handles JSON parsing, error responses, and credentials.
 */

const BASE_URL = '/api';

/**
 * Base fetch wrapper with error handling.
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Include cookies for JWT auth
    };

    const response = await fetch(url, config);
    const data = await response.json();
    console.log(data)

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// ==================
// Auth API
// ==================

export async function getCurrentUser() {
    return fetchAPI('/auth/me');
}

export async function login(email, password) {
    return fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function register(name, email, password) {
    return fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export async function logout() {
    return fetchAPI('/auth/logout', { method: 'POST' });
}

// ==================
// Pages API
// ==================

export async function getPages() {
    return fetchAPI('/pages');
}

export async function getPage(pageId, limit = 10, cursor = null) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (cursor !== null) params.append('cursor', cursor);

    const queryString = params.toString();
    const endpoint = `/pages/${pageId}${queryString ? `?${queryString}` : ''}`;

    return fetchAPI(endpoint);
}

export async function createPage(title = 'Untitled') {
    return fetchAPI('/pages', {
        method: 'POST',
        body: JSON.stringify({ title }),
    });
}

export async function updatePage(pageId, data) {
    return fetchAPI(`/pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deletePage(pageId) {
    return fetchAPI(`/pages/${pageId}`, { method: 'DELETE' });
}

export async function updatePageVisibility(pageId, isPublic) {
    return fetchAPI(`/pages/${pageId}/public`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublic }),
    });
}

// ==================
// Public Access API
// ==================

export async function getPublicPage(pageId) {
    return fetchAPI(`/public/pages/${pageId}`);
}

// ==================
// Blocks API
// ==================

export async function createBlock(pageId, type = 'paragraph', content = { text: '' }) {
    return fetchAPI('/blocks', {
        method: 'POST',
        body: JSON.stringify({ pageId, type, content }),
    });
}

/**
 * Update block - designed for auto-save.
 * Only sends changed fields (partial update).
 * 
 * @param {string} blockId - Block ID
 * @param {object} updates - Fields to update (content, type, order)
 */
export async function updateBlock(blockId, updates) {
    return fetchAPI(`/blocks/${blockId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
}

export async function deleteBlock(blockId) {
    return fetchAPI(`/blocks/${blockId}`, { method: 'DELETE' });
}

/**
 * Create a page block (nested page).
 * This creates both the child page and the block referencing it.
 */
export async function createPageBlock(parentPageId, afterBlockId = null, title = 'Untitled') {
    const response = await fetchAPI('/blocks/page', {
        method: 'POST',
        body: JSON.stringify({ parentPageId, afterBlockId, title }),
    });
    return response;
}

/**
 * Save all blocks for a page (Manual Save / Sync).
 * Replaces the current state with the provided blocks.
 */
export async function savePageContent(pageId, blocks) {
    return fetchAPI(`/pages/${pageId}/blocks`, {
        method: 'PUT',
        body: JSON.stringify({ blocks }),
    });
}
