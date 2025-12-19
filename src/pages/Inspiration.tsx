import React, { useState } from 'react';
import { Plus, Trash2, PenTool, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import styles from './Inspiration.module.css';
import { useStorage } from '../hooks/useStorage';

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
    const [items, setItems] = useStorage<InspirationItem[]>('omnido_inspiration', DEFAULT_ITEMS);

    // Delete Confirmation State
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Handlers
    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            setItems(items.filter(i => i.id !== confirmDeleteId));
            setConfirmDeleteId(null);
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

            {items.length > 0 ? (
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
            ) : (
                <div style={{ marginTop: '4rem' }}>
                    <EmptyState
                        icon={Lightbulb}
                        title="Capture your brilliance"
                        description="Store quotes, images, or quick thoughts. Your future self will thank you for the spark."
                        action={{
                            label: "Add Something",
                            onClick: handleAddNew,
                            icon: Plus
                        }}
                    />
                </div>
            )}
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Item"
                message="Are you sure you want to delete this inspiration item?"
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default Inspiration;
