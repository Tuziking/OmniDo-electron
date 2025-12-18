import { useState, useEffect } from 'react';

/**
 * A hook to persist state in localStorage.
 * 
 * @param key The key to store the data under in localStorage.
 * @param initialValue The initial value to use if no data is found in localStorage.
 * @returns [state, setState] pair similar to useState.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    // Get initial value from localStorage or use provided initialValue
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage whenever state changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}
