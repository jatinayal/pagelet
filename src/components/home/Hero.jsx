'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const FROGS = [
    '/frog1.png',
    '/frog2.png',
    '/frog3.png',
    '/frog4.png',
    '/frog5.png',
    '/frog6.png',
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
            {/* Background Decor */}
            {/* Background Decor - Scaled Down */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-3xl opacity-60" />

            <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center h-full pt-20">
                {/* Left Column: Content */}
                <div className="flex flex-col items-start gap-5 z-10 max-w-lg">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.15]">
                        Think.<span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500"> Write. </span>Organize.
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light">
                        Your digital garden for thoughts, plans, and dreams. <br /> A calmer place for your ideas.
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                        <Link
                            href="/dashboard"
                            className="px-6 py-3 text-base font-semibold text-white bg-gray-900 rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>

                {/* Right Column: Living Mascot */}
                <div className="relative w-full h-[400px] flex items-center justify-center lg:justify-end">
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
                </div>
            </div>
        </section>
    );
}
