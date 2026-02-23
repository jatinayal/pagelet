/**
 * useDebounce Hook
 * ================
 * 
 * Delays updating a value until after a specified delay has passed
 * since the last change. Used for auto-save to prevent excessive API calls.
 * 
 * Usage:
 *   const debouncedValue = useDebounce(value, 500);
 *   useEffect(() => {
 *     // This runs 500ms after value stops changing
 *     saveToServer(debouncedValue);
 *   }, [debouncedValue]);
 */

'use client';

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
