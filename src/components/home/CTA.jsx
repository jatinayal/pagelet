'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTA() {
    return (
        <section className="relative py-32 px-6 flex items-center justify-center overflow-hidden">
            {/* Content Container - Glassmorphism Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 text-center max-w-4xl mx-auto p-12 md:p-16 rounded-[3rem] shadow-2xl overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50"
            >
                {/* Decorative Background Gradients internal to the card */}
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-200/50 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-fuchsia-200/50 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-sm">
                        Ready to build your block ecosystem?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                        Join creators, writers, and technical planners who found their flow with Pagelet's frictionless workspace.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 text-base md:text-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 w-full sm:w-auto text-center"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 text-base md:text-lg font-semibold text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-2xl transition-all w-full sm:w-auto text-center hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
