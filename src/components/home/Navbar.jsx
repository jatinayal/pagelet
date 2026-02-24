import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
            {/* Pill Container */}
            <div className="relative flex items-center gap-5 px-5 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div
                        className="w-7 h-7 bg-[url('/logo.webp')] bg-contain bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-110"
                        aria-label="Pagelet logo"
                    />
                    <span className="text-base font-semibold text-gray-800 tracking-tight">
                        Pagelet
                    </span>
                </Link>

                {/* Divider (optional, subtle) */}
                <div className="h-6 w-px bg-white/30" />

                {/* CTA */}
                <Link
                    href="/dashboard"
                    className="px-4 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-black rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                    Get started
                </Link>

            </div>
        </nav>



    );
}
