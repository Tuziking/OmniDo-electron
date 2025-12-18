import React from 'react';
import { Plus, Trash2, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Inspiration.module.css';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Updated types
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

const DEFAULT_ITEMS: InspirationItem[] = [
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

const Inspiration: React.FC = () => {
    const navigate = useNavigate();
    // State
    const [items, setItems] = useLocalStorage<InspirationItem[]>('omnido_inspiration', DEFAULT_ITEMS);

    // Handlers
    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this item?')) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const handleEdit = (item: InspirationItem) => {
        navigate(`/inspiration/edit/${item.id}`);
    };

    const handleAddNew = () => {
        navigate('/inspiration/new');
    };

    // Masonry Column Distribution
    const getColumns = () => {
        const columns: InspirationItem[][] = [[], [], []];
        items.forEach((item, index) => {
            columns[index % 3].push(item);
        });
        return columns;
    };

    const columns = getColumns();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.headerContent}
                >
                    <h1>Inspiration</h1>
                    <p>Collect your ideas and sparks of creativity.</p>
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={styles.addBtn}
                    onClick={handleAddNew}
                >
                    <Plus size={20} />
                    <span>New Item</span>
                </motion.button>
            </header>

            <div className={styles.masonry}>
                {columns.map((colItems, colIndex) => (
                    <div key={colIndex} className={styles.column}>
                        <AnimatePresence mode="popLayout">
                            {colItems.map((item, itemIdx) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ delay: itemIdx * 0.05 }}
                                    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    className={styles.card}
                                    style={{ backgroundColor: item.color || '#fff' }}
                                    onClick={() => handleEdit(item)}
                                >
                                    {/* Primary Visual Header (Cover or Image Content) */}
                                    {item.coverImage ? (
                                        <div className={styles.coverImage}>
                                            <img src={item.coverImage} alt={item.title} />
                                        </div>
                                    ) : item.type === 'image' && item.content && !item.content.trim().startsWith('![') && !item.content.trim().startsWith('<img') ? (
                                        <div className={styles.coverImage}>
                                            <img src={item.content} alt={item.title} />
                                        </div>
                                    ) : item.type === 'drawing' ? (
                                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                                            <PenTool size={32} />
                                            <span style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Drawing</span>
                                        </div>
                                    ) : null}

                                    <h3>{item.title}</h3>

                                    {item.type === 'quote' && (
                                        <>
                                            <p className={styles.quote}>{item.content}</p>
                                            <span className={styles.author}>{item.author}</span>
                                        </>
                                    )}

                                    {item.type === 'text' && (
                                        <div className={styles.textContent}>
                                            {item.content.slice(0, 150) + (item.content.length > 150 ? '...' : '')}
                                        </div>
                                    )}

                                    <div className={styles.cardActions}>
                                        <motion.button
                                            whileHover={{ scale: 1.1, color: '#ef4444' }}
                                            whileTap={{ scale: 0.9 }}
                                            className={styles.iconBtn}
                                            onClick={(e) => handleDelete(item.id, e)}
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inspiration;
