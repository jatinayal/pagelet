'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const FROGS = [
    '/frog1.webp',
    '/frog2.webp',
    '/frog3.webp',
    '/frog4.webp',
    '/frog5.webp',
    '/frog6.webp',
];

export default function Hero() {
    const [currentFrog, setCurrentFrog] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrog((prev) => (prev + 1) % FROGS.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Decor - Scaled Down */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center h-full pt-20">
                {/* Left Column: Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-start gap-6 z-10 max-w-lg"
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.15]">
                        Think.<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"> Write. </span>Organize.
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed font-normal">
                        Your intelligent workspace for frictionless writing. Combine a fluid block-based editor, granular pagination algorithms, and instant public sharing.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-gray-900 rounded-2xl shadow-lg shadow-purple-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-center"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="#"
                            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl hover:bg-white hover:-translate-y-0.5 transition-all duration-300 shadow-sm text-center"
                        >
                            View Live Demo
                        </Link>
                    </div>
                </motion.div>

                {/* Right Column: Living Mascot */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="relative w-full h-[400px] flex items-center justify-center lg:justify-end"
                >
                    {/* The mascot container */}
                    <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px]">
                        {FROGS.map((src, index) => {
                            const isActive = index === currentFrog;
                            return (
                                <div
                                    key={src}
                                    className={`absolute inset-0 transition-all duration-2000 ease-in-out ${isActive
                                        ? 'opacity-100 scale-100 rotate-0'
                                        : 'opacity-0 scale-95 rotate-1'
                                        }`}
                                >
                                    <Image
                                        src={src}
                                        alt="Mascot Frog"
                                        fill
                                        className="object-contain"
                                        priority={index === 0} // Load first image immediately
                                        unoptimized // Ensure transparency is preserved
                                    />
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
