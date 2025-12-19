import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // Helper to get value from store
    const getStoredValue = (): T => {
        try {
            if (window.ipcRenderer && window.ipcRenderer.store) {
                const item = window.ipcRenderer.store.get(key);
                return item !== undefined ? item : initialValue;
            }
        } catch (error) {
            console.error(`Error reading storage key "${key}":`, error);
        }
        return initialValue;
    };

    const [storedValue, setStoredValue] = useState<T>(getStoredValue);

    useEffect(() => {
        setStoredValue(getStoredValue());
    }, [key]);

    // Update store when state changes
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (window.ipcRenderer && window.ipcRenderer.store) {
                window.ipcRenderer.store.set(key, valueToStore);
            }
        } catch (error) {
            console.error(`Error setting storage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}
