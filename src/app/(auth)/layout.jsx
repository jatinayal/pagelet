/**
 * Auth Layout
 * ===========
 * 
 * Shared layout for authentication pages (login, signup).
 * Uses a light, dreamy theme with a dot-grid background.
 */

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FCFBF9] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Dot Grid */}
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Soft Gradients */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-100/50 blur-[100px] mix-blend-multiply animate-blob" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] rounded-full bg-pink-100/40 blur-[100px] mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md p-6">
                {children}
            </div>
        </div>
    );
}
