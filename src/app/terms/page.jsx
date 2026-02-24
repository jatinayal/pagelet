import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

export const metadata = {
    title: 'Terms of Service | Pagelet',
    description: 'Terms of service for Pagelet block-based workspace.',
};

export default function TermsPage() {
    return (
        <main className="relative min-h-screen text-gray-900 overflow-x-hidden selection:bg-purple-200/50 selection:text-purple-900 font-sans flex flex-col">
            <Navbar />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[40%] bg-cyan-300/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-grow pt-32 pb-20 relative z-10 flex flex-col items-center justify-center">
                <div className="container mx-auto px-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 md:p-12 shadow-xl shadow-indigo-900/5">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Terms of Service</h1>
                        <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                        <div className="space-y-8 text-gray-700 leading-relaxed">
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. User Responsibilities</h2>
                                <p className="mb-3 text-gray-600">
                                    By utilizing the Pagelet editor, you agree to provide accurate registration data and securely maintain your account credentials. You hold sole responsibility for all actions performed originating from your account.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Content Ownership</h2>
                                <p className="mb-3 text-gray-600">
                                    We do not claim ownership over the blocks or text you formulate within the workspace. You retain 100% intellectual property ownership. You simply grant us the minimal technical infrastructure licenses required to save, render, and display your nested pages.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Public Sharing Responsibility</h2>
                                <p className="mb-3 text-gray-600">
                                    When you utilize our "Public Access" toggle, your explicit intent is to share that specific page with anyone on the internet. You bear all responsibility regarding the sensitivity, legality, and public copyright status of any elements incorporated within published pages.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Import and Export Mechanics</h2>
                                <p className="mb-3 text-gray-600">
                                    Our import suite permits the automated extraction of blocks from other public Pagelet documents. It is your strict obligation to ensure you have the moral right or legal permission to clone third-party public blocks into your private environment.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Abuse and Misuse Policy</h2>
                                <p className="mb-3 text-gray-600">
                                    Malicious circumvention of feature limitations—such as programmatic bypassing of our 50-block import limit—is a violation of our terms. We reserve the absolute right to terminate accounts that spam the database, utilize Pagelet to host illegal material, or compromise the editor framework.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
                                <p className="mb-3 text-gray-600">
                                    While we strive to provide bulletproof storage through modern block-syncing, Pagelet and its developers shall not be deemed liable for any indirect damages, data loss, downtime, or rendering errors that may occasionally arise from unhandled exceptions.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
                                <p className="mb-3 text-gray-600">
                                    We provide this block-based platform gracefully on an "as-is" basis. We do restrict liability regarding service interruptions and reserve the right to temporarily pause servers for maintenance without comprehensive prior warning.
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
