import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Trash2, Plus, Settings, ClipboardCheck } from 'lucide-react';
import styles from './Focus.module.css';
import { useLocalStorage } from '../hooks/useLocalStorage';
import EmptyState from '../components/EmptyState';

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_TASKS: Task[] = [
    { id: 1, text: 'Complete project proposal', completed: false },
    { id: 2, text: 'Review design mockups', completed: false },
    { id: 3, text: 'Morning standup', completed: true },
];



const Focus: React.FC = () => {
    // Timer Settings
    const [focusDuration, setFocusDuration] = useLocalStorage<number>('omnido_focus_duration', 25);
    const [breakDuration, setBreakDuration] = useLocalStorage<number>('omnido_break_duration', 5);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Timer State
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);

    // Persisted UI State
    const [tasks, setTasks] = useLocalStorage<Task[]>('omnido_focus_tasks', DEFAULT_TASKS);
    const [focusStreak, setFocusStreak] = useLocalStorage<number>('omnido_focus_streak', 2);

    // Timer Logic
    useEffect(() => {
        let timer: any;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        if (mode === 'focus') setTimeLeft(focusDuration * 60);
        else if (mode === 'shortBreak') setTimeLeft(breakDuration * 60);
        else setTimeLeft(15 * 60);
    }, [mode, focusDuration, breakDuration]);

    useEffect(() => {
        if (!isActive) {
            if (mode === 'focus') setTimeLeft(focusDuration * 60);
            else if (mode === 'shortBreak') setTimeLeft(breakDuration * 60);
        }
    }, [focusDuration, breakDuration, mode, isActive]);

    const changeMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        if (newMode === 'focus') setTimeLeft(focusDuration * 60);
        else if (newMode === 'shortBreak') setTimeLeft(breakDuration * 60);
        else setTimeLeft(15 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Task Logic
    const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const input = e.target as HTMLInputElement;
            const text = input.value.trim();
            if (text) {
                setTasks(prev => [{ id: Date.now(), text, completed: false }, ...prev]);
                input.value = '';
            }
        }
    };

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const deleteTask = (id: number) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const sortedTasks = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));

    return (
        <div className={styles.container}>
            <div className={styles.mainGrid}>
                {/* Left Column: Timer */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${styles.glassCard} ${styles.timerSection}`}
                >
                    <div className={styles.timerControls}>
                        <button
                            className={`${styles.controlBtn} ${mode === 'focus' ? styles.primaryBtn : styles.secondaryBtn}`}
                            onClick={() => changeMode('focus')}
                        >
                            Focus
                        </button>
                        <button
                            className={`${styles.controlBtn} ${mode === 'shortBreak' ? styles.primaryBtn : styles.secondaryBtn}`}
                            onClick={() => changeMode('shortBreak')}
                        >
                            Short Break
                        </button>
                    </div>

                    <motion.div
                        key={`${mode}-${timeLeft}`}
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={styles.timerDisplay}
                    >
                        {formatTime(timeLeft)}
                    </motion.div>

                    <p className={styles.timerLabel}>
                        {mode === 'focus' ? 'Time to concentrate' : 'Rest and recharge'}
                    </p>

                    <div className={styles.timerControls} style={{ marginTop: '2.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`${styles.controlBtn} ${styles.primaryBtn}`}
                            onClick={toggleTimer}
                        >
                            {isActive ? <Pause size={24} /> : <Play size={24} />}
                            <span style={{ marginLeft: '8px' }}>{isActive ? 'Pause' : 'Start'}</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                            onClick={resetTimer}
                        >
                            <RotateCcw size={20} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <Settings size={20} />
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {isSettingsOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={styles.settingsSection}
                            >
                                <div className={styles.durationGrid}>
                                    <div className={styles.durationInput}>
                                        <label>Focus (min)</label>
                                        <input
                                            type="number"
                                            value={focusDuration}
                                            onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                    </div>
                                    <div className={styles.durationInput}>
                                        <label>Break (min)</label>
                                        <input
                                            type="number"
                                            value={breakDuration}
                                            onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* Right Column: Stats & Tasks */}
                <div className={styles.rightCol}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.statsGrid}
                    >
                        <div className={`${styles.glassCard} ${styles.statItem}`}>
                            <div className={styles.statValue}>{completedCount}</div>
                            <div className={styles.statLabel}>Tasks Done</div>
                            <CheckCircle2 size={24} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.2 }} />
                        </div>
                        <div className={`${styles.glassCard} ${styles.statItem}`}>
                            <div className={styles.statValue}>{focusStreak}</div>
                            <div className={styles.statLabel}>Focus Streak</div>
                            <Flame size={24} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.2, color: '#f97316' }} />
                        </div>
                    </motion.div>

                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`${styles.glassCard} ${styles.taskListSection}`}
                    >
                        <header className={styles.taskListHeader}>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>Today's Tasks</h3>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{tasks.length} total</span>
                        </header>

                        <div className={styles.addTaskWrapper}>
                            <Plus className={styles.inputIcon} size={18} />
                            <input
                                className={styles.addTaskInput}
                                placeholder="Add a focus task..."
                                onKeyDown={handleAddTask}
                            />
                        </div>

                        <div className={styles.taskList}>
                            <AnimatePresence mode="popLayout">
                                {sortedTasks.length > 0 ? (
                                    sortedTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{
                                                opacity: task.completed ? 0.6 : 1,
                                                y: 0,
                                                scale: task.completed ? 0.98 : 1
                                            }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                                opacity: { duration: 0.2 }
                                            }}
                                            className={styles.taskItem}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => toggleTask(task.id)}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--action-bg)', cursor: 'pointer' }}
                                            />
                                            <div className={styles.textWrapper}>
                                                <span style={{
                                                    color: task.completed ? 'var(--text-soft)' : 'var(--text-color)',
                                                    transition: 'color 0.3s ease'
                                                }}>
                                                    {task.text}
                                                </span>
                                                <motion.div
                                                    className={styles.strikeLine}
                                                    initial={false}
                                                    animate={{ width: task.completed ? "100%" : "0%" }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={styles.deleteBtn}
                                                onClick={() => deleteTask(task.id)}
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={{ marginTop: '2rem' }}>
                                        <EmptyState
                                            icon={ClipboardCheck}
                                            title="No focus tasks"
                                            description="What's your main priority right now? Add a task to stay on track."
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
};

export default Focus;
