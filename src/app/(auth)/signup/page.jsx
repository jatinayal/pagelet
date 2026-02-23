/**
 * Signup Page
 * ===========
 * 
 * Redesigned with:
 * - Light glassmorphism theme to match dashboard
 * - Lucide icons for inputs
 * - Password visibility toggle
 * - Confirm password validation
 * - Redirect if already authenticated
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as api from '@/lib/apiClient';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth({ required: false });

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await api.register(name, email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
            setLoading(false);
        }
    };

    if (authLoading) return null; // Or a subtle spinner

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 mb-4">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Create an account
                </h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Join Pagelet to start organizing your thoughts
                </p>
            </div>

            {/* Glass Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-8 relative overflow-hidden">
                {/* Decorative Shine */}
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center justify-center animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">
                            Full Name
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200/60 rounded-xl
                                         text-gray-800 placeholder-gray-400 outline-none
                                         focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10
                                         transition-all duration-200"
                                placeholder="Your name"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">
                            Email
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200/60 rounded-xl
                                         text-gray-800 placeholder-gray-400 outline-none
                                         focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10
                                         transition-all duration-200"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-gray-200/60 rounded-xl
                                         text-gray-800 placeholder-gray-400 outline-none
                                         focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10
                                         transition-all duration-200"
                                placeholder="At least 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-gray-200/60 rounded-xl
                                         text-gray-800 placeholder-gray-400 outline-none
                                         focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10
                                         transition-all duration-200"
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer py-2.5 bg-gray-900 hover:bg-black disabled:bg-gray-700
                                 text-white font-medium rounded-xl transition-all duration-200
                                 shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 hover:-translate-y-0.5
                                 flex items-center justify-center gap-2 group mt-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
