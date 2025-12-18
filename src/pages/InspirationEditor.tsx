import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { Excalidraw } from "@excalidraw/excalidraw";
import styles from './InspirationEditor.module.css';

type InspirationType = 'text' | 'image' | 'quote' | 'drawing';

interface InspirationItem {
    id: string;
    type: InspirationType;
    title: string;
    content: string;
    author?: string;
    color?: string;
    coverImage?: string; // base64 encoded image
}

const InspirationEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State
    const [title, setTitle] = useState('');
    const [type, setType] = useState<InspirationType>('text');
    const [content, setContent] = useState('');
    const [drawingData, setDrawingData] = useState<any>({ elements: [], appState: {} });
    const [color, setColor] = useState('#ffffff');
    const [coverImage, setCoverImage] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

    // Initial Load
    useEffect(() => {
        const saved = localStorage.getItem('omnido_inspiration');
        const items: InspirationItem[] = saved ? JSON.parse(saved) : [];

        if (id && id !== 'new') {
            const item = items.find(i => i.id === id);
            if (item) {
                setTitle(item.title);
                setType(item.type);
                setColor(item.color || '#ffffff');
                setCoverImage(item.coverImage || '');

                if (item.type === 'drawing' && item.content) {
                    try {
                        const parsed = JSON.parse(item.content);
                        setDrawingData(parsed);
                    } catch (e) {
                        console.error('Failed to parse drawing:', e);
                    }
                } else {
                    setContent(item.content || '');
                }
            }
        }
        setIsLoaded(true);
    }, [id]);

    // Handle cover image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = useCallback(() => {
        const saved = localStorage.getItem('omnido_inspiration');
        let items: InspirationItem[] = saved ? JSON.parse(saved) : [];

        let finalContent = content;
        let finalCoverImage = coverImage;

        // Auto-extract cover image from Markdown if not manually set
        if (type === 'text' && !finalCoverImage) {
            const mdImageRegex = /!\[.*?\]\((.*?)\)/;
            const htmlImageRegex = /<img.*?src=["'](.*?)["']/;
            const match = content.match(mdImageRegex) || content.match(htmlImageRegex);
            if (match && match[1]) {
                finalCoverImage = match[1];
            } else if (content.trim().startsWith('http') && !content.trim().includes('\n')) {
                // Fallback for raw URL in content
                finalCoverImage = content.trim();
            }
        }

        // For drawing, get current state from Excalidraw
        if (type === 'drawing' && excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            finalContent = JSON.stringify({
                elements: elements,
                appState: {
                    viewBackgroundColor: appState.viewBackgroundColor
                }
            });
        }

        const newItem: InspirationItem = {
            id: (id && id !== 'new') ? id : Date.now().toString(),
            type,
            title: title || 'Untitled',
            content: finalContent,
            color,
            coverImage: finalCoverImage,
            author: ''
        };

        if (id && id !== 'new') {
            items = items.map(i => i.id === id ? { ...i, ...newItem } : i);
        } else {
            items = [newItem, ...items];
        }

        localStorage.setItem('omnido_inspiration', JSON.stringify(items));
        navigate('/inspiration');
    }, [id, type, title, content, color, coverImage, excalidrawAPI, navigate]);

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            {/* Top Navigation Bar */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={styles.topBar}
            >
                <div className={styles.leftSection}>
                    <motion.button
                        whileHover={{ x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className={styles.backBtn}
                        onClick={() => navigate('/inspiration')}
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <input
                        className={styles.titleInput}
                        placeholder="Untitled"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className={styles.rightSection}>
                    <motion.label
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={styles.imageUploadBtn}
                        title="Upload Cover Image"
                    >
                        <Image size={18} />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </motion.label>

                    <select
                        className={styles.typeSelect}
                        value={type}
                        onChange={e => setType(e.target.value as InspirationType)}
                    >
                        <option value="text">Markdown</option>
                        <option value="image">Image URL</option>
                        <option value="drawing">Drawing</option>
                        <option value="quote">Quote</option>
                    </select>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={styles.saveBtn}
                        onClick={handleSave}
                        title="Save"
                    >
                        <Save size={18} />
                    </motion.button>
                </div>
            </motion.div>

            {/* Cover Image Preview */}
            <AnimatePresence>
                {coverImage && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 320 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={styles.coverImagePreview}
                    >
                        <img src={coverImage} alt="" className={styles.coverBlur} />
                        <img src={coverImage} alt="Cover" className={styles.coverMain} />
                        <button
                            className={styles.removeCoverBtn}
                            onClick={() => setCoverImage('')}
                            title="Remove cover image"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={styles.editorContainer}
            >
                {type === 'drawing' ? (
                    <div className={styles.excalidrawContainer}>
                        <Excalidraw
                            excalidrawAPI={(api) => setExcalidrawAPI(api)}
                            initialData={{
                                elements: drawingData.elements || [],
                                appState: {
                                    viewBackgroundColor: "#ffffff",
                                    ...drawingData.appState
                                }
                            }}
                            langCode="zh-CN"
                        />
                    </div>
                ) : (
                    <div className={styles.markdownWrapper}>
                        <MDEditor
                            value={content}
                            onChange={(val) => setContent(val || '')}
                            height="100%"
                            visibleDragbar={false}
                            preview="live"
                            commands={[
                                commands.bold,
                                commands.italic,
                                commands.group([commands.title1, commands.title2], {
                                    name: 'title',
                                    groupName: 'title',
                                    buttonProps: { 'aria-label': 'Insert Title' }
                                }),
                                commands.divider,
                                commands.link,
                                commands.code,
                                commands.unorderedListCommand,
                                commands.checkedListCommand,
                            ]}
                            extraCommands={[]}
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default InspirationEditor;
