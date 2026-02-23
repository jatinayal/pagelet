/**
 * useAuth Hook
 * ============
 * 
 * Manages authentication state and provides user data.
 * Redirects to login if not authenticated.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/apiClient';

export function useAuth({ required = true } = {}) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { user } = await api.getCurrentUser();
            setUser(user);
        } catch (err) {
            setUser(null);
            if (required) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            setUser(null);
            router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return {
        user,
        loading,
        logout: handleLogout,
        isAuthenticated: !!user,
    };
}

export default useAuth;
