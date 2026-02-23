import Link from 'next/link';

export default function CTA() {
    return (
        <section className="relative py-32 px-6 flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            />
            <div className="absolute inset-0  z-0" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
                    Your thoughts, organized.
                </h2>
                <p className="text-lg text-white/90 mb-10 max-w-xl mx-auto drop-shadow">
                    Join thousands of creators, writers, and planners who found their flow with Pagelet.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/signup"
                        className="px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-100 rounded-full shadow-xl transition-transform hover:-translate-y-1 w-full sm:w-auto"
                    >
                        Get Started Free
                    </Link>
                    <Link
                        href="/login"
                        className="px-8 py-4 text-lg font-semibold text-gray-900 border border-white/10 shadow-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors w-full sm:w-auto"
                    >
                        Log in
                    </Link>
                </div>
            </div>
        </section>
    );
}
