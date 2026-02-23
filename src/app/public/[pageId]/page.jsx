/**
 * Public Page Viewer
 * ==================
 * 
 * Read-only view for public pages.
 * - No authentication required
 * - No sidebar/dashboard navigation
 * - No editing controls
 * - Static metadata
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/apiClient';
import { BlockRenderer } from '@/components/blocks';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PublicPage({ params }) {
    const { pageId } = use(params);
    const router = useRouter();

    const [page, setPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPublicPage = async () => {
            try {
                setLoading(true);
                const data = await api.getPublicPage(pageId);
                console.log(data)
                setPage(data.page);
                setBlocks(data.blocks);
                // Update document title
                document.title = data.page.title || 'Pagelet';
            } catch (err) {
                console.error('Failed to load public page:', err);
                setError('Page not found or is private.');
            } finally {
                setLoading(false);
            }
        };

        loadPublicPage();
    }, [pageId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent p-4 text-center">
                <div className="max-w-md bg-white/50 backdrop-blur-md p-8 rounded-2xl border border-white/40 shadow-sm">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h1>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent overflow-y-auto">
            {/* Minimal Header */}
            <header className="fixed w-full top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-gray-200/50">
                <div className="flex flex-row justify-between w-full mx-auto px-8 py-4">
                    <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Pagelet Logo" className="w-6 h-6 object-contain scale-125" />
                        <span className="font-semibold text-gray-700 text-lg tracking-tight">Pagelet</span>
                    </a>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-medium border-l-2 p-2 ">
                        Read Only
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto mt-20 px-6 py-12">
                {/* Page Title */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight break-words mb-4">
                        {page.title}
                    </h1>
                </header>

                {/* Blocks */}
                <div className="space-y-1">
                    {blocks.map((block) => {
                        /**
                         * Background styling for glass card effect.
                         * Consistent with editor but read-only.
                         */
                        const bgStyle = block.backgroundColor
                            ? {
                                backgroundColor: `${block.backgroundColor}66`, // 40% opacity
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                border: '1px solid rgba(0,0,0,0.03)',
                                padding: '8px 16px',
                                borderRadius: '12px'
                            }
                            : {};

                        return (
                            <div
                                key={block._id}
                                style={bgStyle}
                                className={block.backgroundColor ? 'my-1' : ''}
                            >
                                <BlockRenderer
                                    block={block}
                                    readOnly={true}
                                    // No-op handlers for read-only
                                    onChange={() => { }}
                                    onKeyDown={() => { }}
                                    onPageClick={(id) => {
                                        // Handle navigation to other public pages?
                                        // For now, assume child pages might not be public or linked same way.
                                        // If we want to support traversing public trees, we'd route to /public/[id]
                                        router.push(`/public/${id}`);
                                    }}
                                    onPageDelete={() => { }}
                                />
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
