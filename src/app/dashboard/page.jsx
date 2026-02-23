/**
 * Dashboard Page
 * ==============
 * 
 * Main app layout with sidebar and content area.
 * Uses glassmorphism styling throughout.
 * 
 * UX Decision: Sidebar is always visible to show page navigation.
 * Content area adapts based on selected page or shows empty state.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/ui';
import { FileText, Plus } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getPages();
            setPages(data.pages || []);
        } catch (err) {
            if (err.message.includes('Authentication')) {
                router.push('/login');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePage = async () => {
        try {
            setCreating(true);
            const { page } = await api.createPage('Untitled');
            setPages((prev) => [page, ...prev]);
            router.push(`/page/${page._id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePage = async (pageId) => {
        try {
            await api.deletePage(pageId);
            setPages((prev) => prev.filter((p) => p._id !== pageId));
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="min-h-screen bg-transparent">
            {/* Sidebar */}
            <Sidebar
                pages={pages}
                loading={loading}
                creating={creating}
                onCreatePage={handleCreatePage}
                onDeletePage={handleDeletePage}
                onLogout={logout}
            />

            {/* Main Content - offset by sidebar width */}
            <main className="ml-[260px] min-h-screen flex items-center justify-center dot-grid-bg">
                {error && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4">
                        <div className="p-4 bg-red-50/50 border border-red-200/50 backdrop-blur-md
                              rounded-xl text-red-600 text-sm shadow-sm">
                            {error}
                        </div>
                    </div>
                )}

                {/* Empty state when viewing dashboard without a page selected */}
                {!loading && (
                    <div className="text-center p-12 rounded-3xl backdrop-blur-sm bg-white/30 border border-white/40 shadow-xl">
                        <div className="w-20 h-20 bg-white/50 rounded-2xl flex items-center justify-center 
                              mx-auto mb-6 border border-white/60 shadow-sm animate-in zoom-in-50 duration-500">
                            <FileText className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                            Welcome to Pagelet
                        </h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                            Select a page from the sidebar to start writing, or create a brand new one.
                        </p>
                        <button
                            onClick={handleCreatePage}
                            disabled={creating}
                            className="group inline-flex items-center gap-2 px-6 py-3 bg-indigo-100/50 hover:bg-indigo-100/70 
                           backdrop-blur-md border border-indigo-200 rounded-full
                           text-gray-600 hover:text-indigo-600 hover:border-indigo-200
                           text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            <span>{creating ? 'Creating...' : 'Create new page'}</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
