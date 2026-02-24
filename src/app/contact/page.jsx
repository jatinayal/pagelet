'use client';

import { useState } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { MapPin, Phone, Mail, Linkedin, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate network request purely visually
        setTimeout(() => {
            setStatus('success');
            // reset form if we had controlled inputs
        }, 1500);
    };

    return (
        <main className="relative min-h-screen text-gray-900 overflow-x-hidden selection:bg-purple-200/50 selection:text-purple-900 font-sans flex flex-col">
            <Navbar />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[0%] w-[60%] h-[40%] bg-emerald-300/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-grow pt-32 pb-20 relative z-10 flex flex-col items-center">
                <div className="container mx-auto px-6 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Get in touch</h1>
                        <p className="text-lg text-gray-600">
                            Whether you have an enterprise integration inquiry, or merely need assistance setting up your workspace architecture, our staff is available.
                        </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] overflow-hidden shadow-xl shadow-blue-900/5 flex flex-col md:flex-row">

                        {/* Info Column */}
                        <div className="md:w-5/12 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100/50 bg-gradient-to-br from-indigo-50/50 flex flex-col">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Fill up the form and our Team will get back to you within 24-48 hours.
                            </p>

                            <div className="space-y-6 flex-grow">
                                <div className="flex items-start gap-4 text-gray-600 group">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:border-indigo-200 transition-colors">
                                        <Phone className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="pt-2">
                                        <p className="font-medium text-gray-800 cursor-pointer">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 text-gray-600 group">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:border-indigo-200 transition-colors">
                                        <Mail className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="pt-2">
                                        <p className="font-medium text-gray-800 cursor-pointer hover:underline underline-offset-4 decoration-indigo-200">hello@pageletapp.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 text-gray-600 group">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:border-indigo-200 transition-colors">
                                        <Linkedin className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="pt-2">
                                        <p className="font-medium text-gray-800 cursor-pointer hover:underline underline-offset-4 decoration-indigo-200">linkedin.com/company/pagelet</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="md:w-7/12 p-8 md:p-12 relative">
                            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full justify-between">
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-semibold text-gray-700 ml-1">First Name</label>
                                            <input
                                                required
                                                type="text"
                                                disabled={status === 'loading'}
                                                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all disabled:opacity-50"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-semibold text-gray-700 ml-1">Last Name</label>
                                            <input
                                                required
                                                type="text"
                                                disabled={status === 'loading'}
                                                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all disabled:opacity-50"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative mb-6">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            disabled={status === 'loading'}
                                            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all disabled:opacity-50"
                                            placeholder="john@company.com"
                                        />
                                    </div>

                                    <div className="space-y-2 relative mb-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                                        <textarea
                                            required
                                            rows="4"
                                            disabled={status === 'loading'}
                                            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none disabled:opacity-50"
                                            placeholder="Write your message here..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col items-end">
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="relative group flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium rounded-2xl transition-all cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed w-full md:w-auto overflow-hidden"
                                    >
                                        {status === 'loading' ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <Send className="w-4 h-4 ml-1 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Visual Success Toast (Mock implementation) */}
                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute bottom-6 inset-x-8 lg:inset-x-12 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            Successfully sent message. We will reply shortly.
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
