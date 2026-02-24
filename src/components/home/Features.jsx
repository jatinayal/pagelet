'use client';

import { Blocks, Layers, MonitorOff, Save, GripVertical, Bot, Globe, DownloadCloud, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURE_LIST = [
    {
        icon: Blocks,
        title: 'Block-Based Editor',
        description: 'Build your ecosystem sequentially. Text, lists, nested pages, and to-do items operate independently.',
    },
    {
        icon: GripVertical,
        title: 'Drag & Drop Fluidity',
        description: 'Grabbing layout handles instantly organizes complex document matrices without rendering delays.',
    },
    {
        icon: Save,
        title: 'Manual Save Control',
        description: 'Complete data integrity via intentional saves. Reduces unwarranted database pings dramatically.',
    },
    {
        icon: Globe,
        title: 'Public Page Sharing',
        description: 'Immediately transpose secure private clusters into accessible read-only URLs with a single click.',
    },
    {
        icon: DownloadCloud,
        title: 'Block Framework Imports',
        description: 'Legitimately clone up to 50 nested components from public environments right into your private workspace.',
    },
    {
        icon: Bot,
        title: 'Floating AI Assistant',
        description: 'Context-aware intelligence generating content arrays intelligently by parsing your visible DOM.',
    },
    {
        icon: Search,
        title: 'Lazy Load Pagination',
        description: 'Maintain 60 FPS while scrolling infinitely. Database queries segment locally for massive document stability.',
    },
    {
        icon: Layers,
        title: 'Infinite Nesting',
        description: 'Organize logic recursively. Sub-page limits literally do not exist underneath the parent structures.',
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Features() {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        A workspace architected <br className="hidden md:block" /> for modern workflows.
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Highly engineered algorithms underpinning a calming aesthetic.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {FEATURE_LIST.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="group p-6 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 
                         shadow-sm hover:shadow-xl hover:border-purple-200/50 transition-all duration-300 hover:-translate-y-2 flex flex-col"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gray-50/80 flex items-center justify-center mb-5 text-gray-700 group-hover:text-purple-600 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-normal">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
