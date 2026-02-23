import { Plus, PenTool, GitMerge, CheckCircle2 } from 'lucide-react';

const STEPS = [
    {
        icon: Plus,
        title: 'Create a page',
        description: 'Start with a blank canvas. Give it a title and an icon.',
    },
    {
        icon: PenTool,
        title: 'Add content',
        description: 'Type / to add headings, lists, quotes, and more.',
    },
    {
        icon: GitMerge,
        title: 'Organize',
        description: 'Nest pages inside pages to build your personal wiki.',
    },
    {
        icon: CheckCircle2,
        title: 'Stay focused',
        description: 'A calm environment for your best work.',
    }
];

export default function HowItWorks() {
    return (
        <section className="py-24 px-6 ">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">How Pagelet Works</h2>
                    <p className="text-gray-600">Simple steps to clear your mind.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-10" />

                    {STEPS.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6 
                                          group-hover:scale-110 group-hover:border-purple-200 transition-all duration-300 z-10">
                                <step.icon className="w-6 h-6 text-gray-500 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-sm text-gray-500 max-w-[200px]">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
