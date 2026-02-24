'use client';

import { GraduationCap, Code2, PenLine, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const USE_CASES = [
    {
        icon: GraduationCap,
        label: 'Students',
        desc: 'Organize notes & assignments',
        color: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
    },
    {
        icon: Code2,
        label: 'Developers',
        desc: 'Write docs & code snippets',
        color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    },
    {
        icon: PenLine,
        label: 'Writers',
        desc: 'Draft stories & articles',
        color: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
    },
    {
        icon: Calendar,
        label: 'Planners',
        desc: 'Manage tasks & goals',
        color: 'bg-green-50 text-green-600 group-hover:bg-green-100',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function UseCases() {
    return (
        <section className="py-20 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="container mx-auto max-w-5xl text-center"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Built for everyone.</h2>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {USE_CASES.map((useCase, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="p-6 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md hover:bg-white/60 
                         transition-all duration-300 hover:-translate-y-1 cursor-default group"
                        >
                            <div className={`w-12 h-12 rounded-xl border border-white/50 ${useCase.color} flex items-center justify-center mx-auto mb-4 
                             group-hover:scale-110 transition-all duration-300`}>
                                <useCase.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{useCase.label}</h3>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{useCase.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
