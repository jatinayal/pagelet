import { Blocks, Layers, MonitorOff, Save, GripVertical, Sparkles } from 'lucide-react';

const FEATURE_LIST = [
    {
        icon: Blocks,
        title: 'Block-based editing',
        description: 'Build your ideas block by block. Text, images, code—everything is a block.',
    },
    {
        icon: Layers,
        title: 'Nested pages',
        description: 'No more folders. Organize your thoughts hierarchically with infinite nesting.',
    },
    {
        icon: MonitorOff,
        title: 'Distraction-free',
        description: 'A clean interface that fades away, letting you focus entirely on your writing.',
    },
    {
        icon: Save,
        title: 'Auto-save',
        description: 'Never lose a thought. Your work is saved instantly as you type.',
    },
    {
        icon: GripVertical,
        title: 'Drag & Drop',
        description: 'Reorganize easily. Move blocks around to structure your thoughts naturally.',
    },
    {
        icon: Sparkles,
        title: 'AI Assistance',
        description: 'Coming soon. Writing help, summarization, and brainstorming partners.',
    },
];

export default function Features() {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Everything you need to <br className="hidden md:block" /> organize your life.
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A simple yet powerful tool for your thoughts, plans, and projects.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURE_LIST.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 
                         shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center mb-4 text-gray-700 group-hover:text-purple-600 group-hover:bg-purple-50 transition-colors">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
