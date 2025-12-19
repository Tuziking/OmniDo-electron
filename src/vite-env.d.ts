/// <reference types="vite/client" />

interface Window {
    ipcRenderer: {
        store: {
            get: (key: string) => any;
            set: (key: string, value: any) => void;
            delete: (key: string) => void;
        };
        on: (channel: string, func: (...args: any[]) => void) => void;
        off: (channel: string, func: (...args: any[]) => void) => void;
        send: (channel: string, ...args: any[]) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
}
