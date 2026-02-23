/**
 * Loading Skeletons
 * =================
 * 
 * Skeleton components for loading states.
 * Uses subtle pulse animation for perceived performance.
 */

'use client';

/**
 * Editor skeleton - shows during page load
 */
export function EditorSkeleton() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-8 animate-pulse">
            {/* Title skeleton */}
            <div className="h-12 bg-white/5 rounded-lg w-2/3 mb-8" />

            {/* Block skeletons */}
            <div className="space-y-4">
                <div className="h-6 bg-white/5 rounded w-full" />
                <div className="h-6 bg-white/5 rounded w-5/6" />
                <div className="h-6 bg-white/5 rounded w-4/5" />
                <div className="h-6 bg-white/5 rounded w-full" />
                <div className="h-6 bg-white/5 rounded w-3/4" />
            </div>
        </div>
    );
}

/**
 * Page list skeleton - shows in sidebar during load
 */
export function PageListSkeleton({ count = 5 }) {
    return (
        <div className="space-y-2 animate-pulse">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="h-9 bg-white/5 rounded-lg" />
            ))}
        </div>
    );
}

export default { EditorSkeleton, PageListSkeleton };
