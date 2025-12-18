import React, { useState, useRef, useEffect } from 'react';
import { Folder, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProjectCard.module.css';

interface Project {
    id: string;
    title: string;
    taskCount: number;
    color: string;
}

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(project);
        setShowMenu(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(project.id);
        setShowMenu(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            className={styles.card}
        >
            <div className={styles.header}>
                <motion.div
                    whileHover={{ rotate: 10 }}
                    className={styles.iconWrapper}
                    style={{ backgroundColor: project.color }}
                >
                    <Folder size={20} color="white" />
                </motion.div>
                <div className={styles.menuWrapper} ref={menuRef}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={styles.moreBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                    >
                        <MoreHorizontal size={16} />
                    </motion.button>
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className={styles.dropdown}
                            >
                                <button onClick={handleEdit} className={styles.menuItem}>
                                    <Edit2 size={14} />
                                    <span>Edit</span>
                                </button>
                                <button onClick={handleDelete} className={`${styles.menuItem} ${styles.deleteItem}`}>
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{project.title}</h3>
                <div className={styles.progressSection}>
                    <div className={styles.progressInfo}>
                        <span className={styles.count}>{project.taskCount} tasks</span>
                        <span className={styles.percent}>75%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={styles.progressFill}
                            style={{ backgroundColor: project.color }}
                        ></motion.div>
                    </div>
                </div>
                <div className={styles.avatars}>
                    {[1, 2].map(i => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -3, scale: 1.1 }}
                            className={styles.avatar}
                        ></motion.div>
                    ))}
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={styles.addAvatar}
                    >+</motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectCard;
