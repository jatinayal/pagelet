import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import {
    LayoutTemplate,
    GripHorizontal,
    Save,
    Globe,
    DownloadCloud,
    Bot,
    Search,
    Wand2
} from 'lucide-react';

export const metadata = {
    title: 'Features | Pagelet',
    description: 'Explore the powerful features of the Pagelet workspace.',
};

const featureList = [
    {
        title: "Block-based editor",
        description: "Focus on individual thought elements. Transform paragraphs into logical components cleanly separated via structure.",
        icon: <LayoutTemplate className="w-6 h-6 text-indigo-500" />
    },
    {
        title: "Drag and drop",
        description: "Grab the drag handles positioned natively on each layout block to fluidly sort or stack complex paragraph matrices.",
        icon: <GripHorizontal className="w-6 h-6 text-purple-500" />
    },
    {
        title: "Manual save system",
        description: "Maintain ultimate control over your revision cycles. Intentional saving mechanics safeguard complex document states against network interruptions.",
        icon: <Save className="w-6 h-6 text-blue-500" />
    },
    {
        title: "Public page sharing",
        description: "Transform private internal drafts into accessible URLs shared selectively using instantaneous global web-publishing toggles.",
        icon: <Globe className="w-6 h-6 text-green-500" />
    },
    {
        title: "Import from public pages",
        description: "Securely duplicate logic chains or templates by copying raw layouts from one open ecosystem environment safely to your private database.",
        icon: <DownloadCloud className="w-6 h-6 text-orange-500" />
    },
    {
        title: "AI assistant",
        description: "Command a dedicated artificial intelligence to construct layouts or summarize data directly within the editor via floating prompts.",
        icon: <Bot className="w-6 h-6 text-pink-500" />
    },
    {
        title: "Lazy loading pagination",
        description: "Enormous architectures parse perfectly by deferring render thresholds—achieving 60 frames per second scroll experiences effortlessly.",
        icon: <Search className="w-6 h-6 text-cyan-500" />
    },
    {
        title: "Clean modern UI",
        description: "We utilized subtle color palettes, layered transparencies, and dreamy glassmorphism techniques ensuring zero ocular fatigue.",
        icon: <Wand2 className="w-6 h-6 text-rose-500" />
    }
];

export default function FeaturesPage() {
    return (
        <main className="relative min-h-screen text-gray-900 overflow-x-hidden selection:bg-purple-200/50 selection:text-purple-900 font-sans flex flex-col">
            <Navbar />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[40%] bg-purple-300/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-grow pt-32 pb-20 relative z-10 flex flex-col items-center">
                <div className="container mx-auto px-6 max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Platform Features</h1>
                        <p className="text-lg text-gray-600">
                            Discover the robust toolset that powers intuitive content creation, fluid collaboration capabilities, and next-generation document structuring mechanics.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featureList.map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default flex flex-col items-start"
                            >
                                <div className="w-12 h-12 bg-gray-50/80 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed text-left flex-grow">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
