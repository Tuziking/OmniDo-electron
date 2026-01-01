export type InspirationType = 'text' | 'image' | 'quote' | 'drawing';

export interface InspirationItem {
    id: string;
    type: InspirationType;
    title: string;
    content: string; // URL for image, Text/Markdown for others, JSON for drawing
    author?: string; // For quotes
    color?: string; // Background color
    coverImage?: string; // base64 encoded cover image
}

export const INSPIRATION_STORAGE_KEY = 'omnido_inspiration';

export const DEFAULT_INSPIRATION_ITEMS: InspirationItem[] = [
    {
        id: '1',
        type: 'image',
        title: 'Minimalist Design',
        content: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
        color: '#ffffff'
    },
    {
        id: '2',
        type: 'quote',
        title: 'Design Philosophy',
        content: '"Simplicity is the ultimate sophistication."',
        author: '- Leonardo da Vinci',
        color: '#e8f4f8'
    },
    {
        id: '3',
        type: 'text',
        title: 'Reading List',
        content: '• Atomic Habits\n• Deep Work\n• Essentialism',
        color: '#f9f9f9'
    }
];
