import Link from 'next/link';

export default function CTA() {
    return (
        <section className="relative py-32 px-6 flex items-center justify-center overflow-hidden">
            {/* Content Container - Glassmorphism Card */}
            <div className="relative z-10 text-center max-w-4xl mx-auto p-12 md:p-16 rounded-[3rem] shadow-2xl overflow-hidden"

            >
                {/* Decorative Background Gradients internal to the card */}
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-200/50 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-fuchsia-200/50 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 tracking-tight drop-shadow-sm">
                        Your thoughts, organized.
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
                        Join thousands of creators, writers, and planners who found their flow with Pagelet.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="px-8 py-4 text-base md:text-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 w-full sm:w-auto text-center"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 text-base md:text-lg font-semibold text-gray-700 bg-white/70 hover:bg-white border border-gray-200 shadow-sm rounded-full transition-all w-full sm:w-auto text-center hover:shadow-md hover:-translate-y-0.5"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
