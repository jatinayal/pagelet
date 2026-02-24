'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

const faqs = [
    {
        question: "How to create a page?",
        answer: "Navigate to your Dashboard and click the '+ New Page' button in the top right navigation header, or use the sidebar \"New Page\" action to generate a fresh workspace instantly."
    },
    {
        question: "How to add blocks?",
        answer: "Click the 'Add a block' button at the bottom of the editor, or press 'Enter' while focused on a text block to seamlessly append a new paragraph."
    },
    {
        question: "How to make a page public?",
        answer: "Open a page, select the 'Access' button located on the top right NavBar next to the Save button, and toggle the switch. A shareable link will be generated automatically."
    },
    {
        question: "How to import blocks?",
        answer: "Within any private page editor, click the 'Import' button located in the top Navbar alongside the Access controls. Provide a public URL, and the system will clone up to 50 blocks directly into your active workspace."
    },
    {
        question: "What happens if I don't save?",
        answer: "The platform actively tracks changes and marks unsaved edits identically to a traditional filesystem via the 'Save' badge. If you navigate away utilizing our intuitive sidebars or breadcrumbs without pushing changes manually, a smart modal will emerge to guard against data loss, offering you the choice to save or discard first."
    },
    {
        question: "How pagination works?",
        answer: "To guarantee peak performance and minimize rendering lag, our editor implements intelligent lazy loading, injecting small chunks of heavily customized layout blocks seamlessly as you scroll downwards."
    },
    {
        question: "How AI assistant helps?",
        answer: "The AI agent persistently floats in the bottom right corner of your workspace. It comprehends your current document state globally and can intelligently execute block creations or large-scale content edits merely through natural language commands."
    }
];

export default function HelpPage() {
    return (
        <main className="relative min-h-screen text-gray-900 overflow-x-hidden selection:bg-purple-200/50 selection:text-purple-900 font-sans flex flex-col">
            <Navbar />

            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[40%] bg-purple-300/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-grow pt-32 pb-20 relative z-10 flex flex-col items-center">
                <div className="container mx-auto px-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Help Center</h1>
                        <p className="text-lg text-gray-600">
                            Welcome to the Pagelet Help Center. Our platform is built on modern block-based paradigms, intertwining lightning-fast editing dynamics with comprehensive data privacy. Below you'll find operational mechanics covering standard interactions.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none cursor-pointer group"
            >
                <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100/50 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
