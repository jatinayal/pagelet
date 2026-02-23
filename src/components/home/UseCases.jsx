import { GraduationCap, Code2, PenLine, Calendar } from 'lucide-react';

const USE_CASES = [
    {
        icon: GraduationCap,
        label: 'Students',
        desc: 'Organize notes & assignments',
        color: 'bg-orange-50 text-orange-600',
    },
    {
        icon: Code2,
        label: 'Developers',
        desc: 'Write docs & snippets',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        icon: PenLine,
        label: 'Writers',
        desc: 'Draft stories & articles',
        color: 'bg-pink-50 text-pink-600',
    },
    {
        icon: Calendar,
        label: 'Planners',
        desc: 'Manage tasks & goals',
        color: 'bg-green-50 text-green-600',
    },
];

export default function UseCases() {
    return (
        <section className="py-20 px-6">
            <div className="container mx-auto max-w-5xl text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-10">Built for everyone.</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {USE_CASES.map((useCase, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-2xl bg-white/40 border border-white/40 shadow-sm hover:bg-white/60 
                         transition-all duration-300 hover:-translate-y-1 cursor-default group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${useCase.color} flex items-center justify-center mx-auto mb-4 
                             group-hover:scale-110 transition-transform`}>
                                <useCase.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{useCase.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{useCase.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
