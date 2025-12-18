
import React, { useState, useRef, useEffect } from 'react';
import { Check, MoreHorizontal, Edit2, Trash2, Flame, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HabitItem.module.css';
import { formatLocalDate } from '../utils/dateUtils';

interface Habit {
    id: string;
    title: string;
    streak: number;
    goal: number;
    progress: number;
    startDate: string;
    history: Record<string, number>;
}

interface HabitItemProps {
    habit: Habit;
    onIncrement: (id: string) => void;
    onClick: (habit: Habit) => void;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onIncrement, onClick, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
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

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(habit);
        setShowMenu(false);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this habit?')) {
            onDelete(habit.id);
        }
        setShowMenu(false);
    };

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onIncrement(habit.id);
    };

    const toggleHeatmap = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowHeatmap(!showHeatmap);
    };

    const getHeatmapDays = () => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let start = new Date(habit.startDate);
        if (isNaN(start.getTime())) {
            start = new Date(today);
            start.setDate(today.getDate() - 30);
        } else {
            start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        }

        const diffTime = Math.abs(today.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= diffDays; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const getDayLevel = (date: Date) => {
        const dateStr = formatLocalDate(date);
        const progress = habit.history?.[dateStr] || 0;
        if (progress === 0) return 0;
        const percentage = progress / habit.goal;
        if (percentage >= 1) return 4;
        if (percentage >= 0.75) return 3;
        if (percentage >= 0.5) return 2;
        return 1;
    };

    const isCompleted = habit.progress >= habit.goal;
    const progressPercent = Math.min((habit.progress / habit.goal) * 100, 100);
    const heatmapDays = getHeatmapDays();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={styles.itemWrapper}
        >
            <motion.div
                whileHover={{ y: -2 }}
                className={styles.item}
                onClick={() => onClick(habit)}
            >
                <div className={styles.cardTop}>
                    <div className={styles.iconWrapper}>
                        <div className={styles.icon}>{habit.title.charAt(0)}</div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`${styles.checkInBtn} ${isCompleted ? styles.checkInDone : ''}`}
                        onClick={handleActionClick}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isCompleted ? 'checked' : 'plus'}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className={styles.btnContent}
                            >
                                {isCompleted ? <Check size={24} /> : <Plus size={24} />}
                            </motion.div>
                        </AnimatePresence>
                    </motion.button>
                </div>

                <div className={styles.actions}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={styles.iconBtn}
                        onClick={toggleHeatmap}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={showHeatmap ? "up" : "down"}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {showHeatmap ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </motion.div>
                        </AnimatePresence>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={styles.iconBtn}
                        onClick={handleMenuClick}
                    >
                        <MoreHorizontal size={18} />
                    </motion.button>
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className={styles.menu}
                                ref={menuRef}
                                onClick={e => e.stopPropagation()}
                            >
                                <button className={styles.menuItem} onClick={handleEditClick}>
                                    <Edit2 size={16} /> Edit Habit
                                </button>
                                <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={handleDeleteClick}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>{habit.title}</h3>
                        <motion.div
                            key={habit.progress}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`${styles.status} ${isCompleted ? styles.statusDone : ''}`}
                        >
                            {isCompleted ? 'Goal Reached' : `${habit.progress} / ${habit.goal}`}
                        </motion.div>
                    </div>
                    <div className={styles.stats}>
                        <div className={styles.progressContainer}>
                            <div className={styles.progress}>
                                <motion.div
                                    className={styles.progressBar}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                ></motion.div>
                            </div>
                        </div>
                        <div className={styles.statsFooter}>
                            <span className={styles.streak}>
                                <Flame size={14} className={styles.fireIcon} fill="currentColor" /> {habit.streak} day streak
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showHeatmap && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={styles.heatmapSection}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={styles.heatmapGrid}>
                            {heatmapDays.map((date, i) => {
                                const level = getDayLevel(date);
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.005 }}
                                        className={`${styles.heatmapCell} ${styles[`level${level}`]}`}
                                        title={`${formatLocalDate(date)}: Level ${level}`}
                                    ></motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HabitItem;

