'use client';

import { Plus, GripHorizontal, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
    {
        icon: Plus,
        title: '1. Create a workspace',
        description: 'Start with a blank canvas or import blocks seamlessly from public environments.',
    },
    {
        icon: GripHorizontal,
        title: '2. Build with Blocks',
        description: 'Type / to add headings, lists, quotes, and drag them into perfect layouts.',
    },
    {
        icon: Globe,
        title: '3. Share publicly',
        description: 'Publish your pages instantly to the web with a simple toggle switch.',
    },
    {
        icon: Sparkles,
        title: '4. Ask the AI',
        description: 'Use the floating Pebble AI to generate content and brainstorm ideas directly.',
    }
];

export default function HowItWorks() {
    return (
        <section className="py-24 px-6 ">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="container mx-auto max-w-5xl"
            >
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">How Pagelet Works</h2>
                    <p className="text-gray-600 text-lg">Simple steps to clear your mind and organize your life.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-gray-300 to-transparent -z-10" />

                    {STEPS.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm flex items-center justify-center mb-6 
                                          group-hover:scale-110 group-hover:border-purple-200 transition-all duration-300 z-10">
                                <step.icon className="w-6 h-6 text-gray-500 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
