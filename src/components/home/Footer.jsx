import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative w-full pt-20 pb-0 bg-white/60 backdrop-blur-xl border-t border-white/40 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            <div className="w-10 h-10 relative">
                                <Image src="/logo.webp" alt="Logo" fill className="object-contain " />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Pagelet</span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A block-based workspace for your personal wiki, docs, and projects.
                            Designed for focus and clarity.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><Link href="/features" className="hover:text-purple-600 transition-colors">Features</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><Link href="/help" className="hover:text-purple-600 transition-colors">Help Center</Link></li>
                            <li><Link href="/contact" className="hover:text-purple-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><Link href="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-purple-600 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-purple-600 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-200 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} Pagelet Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="https://github.com/jatinayal/pagelet" className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://linkedin.com/in/jatin-nayal-300438353" className="text-gray-400 hover:text-[#0077b5] transition-colors p-2 hover:bg-blue-50 rounded-full">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="mailto:jatinsingh89234@gmail.com" className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

        </footer>
    );
}
