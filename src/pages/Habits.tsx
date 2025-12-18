import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Flame, Target, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HabitItem from '../components/HabitItem';
import styles from './Habits.module.css';
import { formatLocalDate } from '../utils/dateUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Habit {
    id: string;
    title: string;
    streak: number;
    goal: number;
    progress: number;
    startDate: string;
    history: Record<string, number>; // 'YYYY-MM-DD': progress
}

const DEFAULT_HABITS: Habit[] = [
    {
        id: '1',
        title: 'Morning Meditation',
        streak: 5,
        goal: 1,
        progress: 0,
        startDate: '2025-12-01',
        history: { '2025-12-01': 1, '2025-12-02': 1 }
    },
    {
        id: '2',
        title: 'Read 30 mins',
        streak: 12,
        goal: 1,
        progress: 1,
        startDate: '2025-12-01',
        history: {}
    },
    {
        id: '3',
        title: 'Drink 2L Water',
        streak: 3,
        goal: 8,
        progress: 3,
        startDate: '2025-12-01',
        history: {}
    },
];

const Habits: React.FC = () => {
    const navigate = useNavigate();
    const [habits, setHabits] = useLocalStorage<Habit[]>('omnido_habits', DEFAULT_HABITS);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [habitTitle, setHabitTitle] = useState('');
    const [habitGoal, setHabitGoal] = useState(1);

    // Summary Stats
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.progress >= h.goal).length;
    const avgStreak = totalHabits > 0
        ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / totalHabits)
        : 0;

    const handleIncrement = (id: string) => {
        setHabits(habits.map(h => {
            if (h.id === id) {
                const today = formatLocalDate(new Date());
                let newProgress = h.progress;

                if (h.goal === 1) {
                    newProgress = h.progress === 1 ? 0 : 1;
                } else {
                    newProgress = h.progress < h.goal ? h.progress + 1 : h.progress;
                }

                const newHistory = { ...h.history, [today]: newProgress };
                return { ...h, progress: newProgress, history: newHistory };
            }
            return h;
        }));
    };

    const handleAddClick = () => {
        setEditingHabit(null);
        setHabitTitle('');
        setHabitGoal(1);
        setIsModalOpen(true);
    };

    const handleEditClick = (habit: Habit) => {
        setEditingHabit(habit);
        setHabitTitle(habit.title);
        setHabitGoal(habit.goal);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    const handleSave = () => {
        if (!habitTitle.trim()) return;

        if (editingHabit) {
            setHabits(habits.map(h => h.id === editingHabit.id ? { ...h, title: habitTitle, goal: habitGoal } : h));
        } else {
            const newHabit: Habit = {
                id: Date.now().toString(),
                title: habitTitle,
                streak: 0,
                goal: habitGoal,
                progress: 0,
                startDate: formatLocalDate(new Date()),
                history: {}
            };
            setHabits([...habits, newHabit]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.headerTitle}
                >
                    <h1>Habits</h1>
                    <p>Build better routines, one day at a time.</p>
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={styles.addBtn}
                    onClick={handleAddClick}
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>New Habit</span>
                </motion.button>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={styles.statsOverview}
            >
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Target size={16} color="var(--primary)" />
                        <span>Active Habits</span>
                    </div>
                    <div className={styles.statValue}>{totalHabits}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span>Completed Today</span>
                    </div>
                    <div className={styles.statValue}>{completedToday}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Flame size={16} color="var(--accent)" />
                        <span>Average Streak</span>
                    </div>
                    <div className={styles.statValue}>{avgStreak} days</div>
                </div>
            </motion.div>

            <div className={styles.list}>
                <AnimatePresence mode="popLayout">
                    {habits.map(habit => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            onIncrement={handleIncrement}
                            onClick={(h) => navigate(`/habits/${h.id}`, { state: h })}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.modalOverlay}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={styles.modal}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>{editingHabit ? 'Edit Habit' : 'New Habit'}</h2>
                                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className={styles.modalContent}>
                                <div className={styles.inputGroup}>
                                    <label>Habit Title</label>
                                    <input
                                        type="text"
                                        value={habitTitle}
                                        onChange={(e) => setHabitTitle(e.target.value)}
                                        placeholder="e.g., Read 30 mins"
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Daily Goal (Times)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={habitGoal}
                                        onChange={(e) => setHabitGoal(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Habits;
