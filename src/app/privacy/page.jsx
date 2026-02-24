import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

export const metadata = {
    title: 'Privacy Policy | Pagelet',
    description: 'Privacy policy for Pagelet block-based workspace.',
};

export default function PrivacyPage() {
    return (
        <main className="relative min-h-screen text-gray-900 overflow-x-hidden selection:bg-purple-200/50 selection:text-purple-900 font-sans flex flex-col">
            <Navbar />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-pink-300/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-grow pt-32 pb-20 relative z-10 flex flex-col items-center justify-center">
                <div className="container mx-auto px-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 md:p-12 shadow-xl shadow-purple-900/5">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
                        <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                        <div className="space-y-8 text-gray-700 leading-relaxed">
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data We Collect</h2>
                                <p className="mb-3">We collect information essential to providing our block-based editing experience. This includes:</p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li><strong>Account Information:</strong> Your name, email address, and authentication credentials.</li>
                                    <li><strong>Page Content & Blocks:</strong> The text, images, nested structures, and attributes of the blocks you create within your workspace.</li>
                                    <li><strong>Public Pages:</strong> Any pages you explicitly mark as public for sharing purposes.</li>
                                    <li><strong>Usage Data:</strong> Anonymized analytical data outlining how you interact with our editor to help us improve UI performance.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
                                <p className="mb-3">Your data is utilized strictly to provide and improve the Pagelet service:</p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>To synchronize and render your page drafts across devices.</li>
                                    <li>To facilitate the public sharing mechanism when you choose to publish a page.</li>
                                    <li>To empower our AI assistant to contextually answer questions based on the page content you provide.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Public Page Visibility</h2>
                                <p className="text-gray-600">
                                    By default, all pages are entirely private and accessible only to your authenticated account.
                                    If you toggle the "Public Access" setting on a page, its contents become accessible to anyone with the generated URL.
                                    You can instantly revoke public access at any time through the same menu, rendering the link inactive.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies Usage</h2>
                                <p className="text-gray-600">
                                    We utilize essential cookies to maintain your login session and secure your workspace. For a detailed breakdown of the cookies we place, please review our <a href="/cookies" className="text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-indigo-200 underline-offset-4">Cookie Policy</a>.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Storage</h2>
                                <p className="text-gray-600">
                                    Your data, including encrypted authentication credentials and workspace documents, is securely hosted on MongoDB clusters. We implement industry-standard encryption protocols both in transit and at rest to safeguard your intellectual property.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                                <p className="text-gray-600">
                                    You maintain full ownership of all content created on Pagelet. You have the unalienable right to edit, export, or permanently delete any pages or individual blocks at any time. You may also request total deletion of your account and its associated data by contacting our support team.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Information</h2>
                                <p className="text-gray-600">
                                    If you have questions about this privacy statement or your personal data, please securely submit a request through our <a href="/contact" className="text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-indigo-200 underline-offset-4">Contact Page</a>.
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
