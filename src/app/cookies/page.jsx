import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

export const metadata = {
    title: 'Cookie Policy | Pagelet',
    description: 'Cookie policy for Pagelet block-based workspace.',
};

export default function CookiesPage() {
    return (
        <main className="relative min-h-screen text-gray-900 overflow-x-hidden selection:bg-purple-200/50 selection:text-purple-900 font-sans flex flex-col">
            <Navbar />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-pink-300/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-violet-300/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-grow pt-32 pb-20 relative z-10 flex flex-col items-center justify-center">
                <div className="container mx-auto px-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 md:p-12 shadow-xl shadow-pink-900/5">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Cookie Policy</h1>
                        <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                        <div className="space-y-8 text-gray-700 leading-relaxed">
                            <p className="text-lg text-gray-600 mb-6">
                                This Cookie Policy elucidates exactly what cookies we set directly onto your device while you edit documents or utilize the application interfaces.
                            </p>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Essential Operations Cookies</h2>
                                <p className="mb-3 text-gray-600">
                                    These are non-negotiable cookies mandated by modern web frameworks (like Next.js) to accurately route requests, manage memory allocation, and verify secure CSRF tokens when executing database manipulations. Disabling these will render the editor totally non-functional.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Authentication & Session Cookies</h2>
                                <p className="mb-3 text-gray-600">
                                    We exclusively employ secure, `HttpOnly` JSON Web Token (JWT) cookies strictly to verify that the person attempting to query an encrypted block array actually owns those blocks. These cookies are attached strictly upon login and evaporate when you execute a logout motion or after natural expiration timing.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Analytics & UX Integrity</h2>
                                <p className="mb-3 text-gray-600">
                                    Presently, we prioritize minimalism and do not embed pervasive third-party tracking pixels. If minimally invasive analytical tracking is introduced solely to measure global feature retention maps (such as block UI interactions), their footprint will remain fully anonymous and isolated within the domain state.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How to Control Cookies</h2>
                                <p className="mb-3 text-gray-600">
                                    Because our architecture primarily sets purely essential and session cookies necessary to render the requested encrypted interfaces, turning them off inside your browser settings will immediately prohibit your capacity to log in securely or retrieve private data contexts. Consequently, if you firmly refuse authentication cookies, we humbly ask you to forego logging strings to the service entirely.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
