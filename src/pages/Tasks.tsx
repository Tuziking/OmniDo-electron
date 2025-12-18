import React, { useState } from 'react';
import TaskItem from '../components/TaskItem';
import CalendarView from '../components/CalendarView';
import TimelineView from '../components/TimelineView';
import DateTimePicker from '../components/DateTimePicker';
import { Plus, List, Calendar, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Tasks.module.css';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    date?: Date;
    startTime?: string;
    duration?: number;
}

const DEFAULT_TASKS: Task[] = [
    {
        id: '1',
        title: 'Design system architecture',
        completed: false,
        date: new Date(new Date().setHours(9, 0, 0, 0)),
        startTime: '09:00',
        duration: 60
    },
    {
        id: '2',
        title: 'Setup Electron boilerplate',
        completed: true,
        date: new Date(new Date().setHours(10, 30, 0, 0)),
        startTime: '10:30',
        duration: 90
    },
    {
        id: '3',
        title: 'Implement core UI',
        completed: false,
        date: new Date(new Date().setHours(13, 0, 0, 0)),
        startTime: '13:00',
        duration: 120
    },
];

const Tasks: React.FC = () => {
    const [view, setView] = useState<'list' | 'calendar' | 'timeline'>('list');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useLocalStorage<Task[]>('omnido_tasks', DEFAULT_TASKS);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState<Date>(new Date());

    const handleToggle = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDelete = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleAddTask = (selectedDate: Date) => {
        if (!newTaskTitle.trim()) return;

        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');

        const newTask: Task = {
            id: Date.now().toString(),
            title: newTaskTitle,
            completed: false,
            date: selectedDate,
            startTime: `${hours}:${minutes}`,
            duration: 60 // Default duration
        };

        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
        setShowAddModal(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerTitle}>
                        <h1>Tasks</h1>
                        <p className={styles.subtitle}>{tasks.filter(t => !t.completed).length} tasks remaining</p>
                    </div>
                    <div className={styles.viewSwitcher}>
                        <button
                            className={`${styles.viewBtn} ${view === 'list' ? styles.activeView : ''}`}
                            onClick={() => setView('list')}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            className={`${styles.viewBtn} ${view === 'calendar' ? styles.activeView : ''}`}
                            onClick={() => setView('calendar')}
                            title="Calendar View"
                        >
                            <Calendar size={20} />
                        </button>
                        <button
                            className={`${styles.viewBtn} ${view === 'timeline' ? styles.activeView : ''}`}
                            onClick={() => setView('timeline')}
                            title="Timeline View"
                        >
                            <Clock size={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.statsOverview}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <List size={16} className={styles.statIcon} />
                            <span>Total Tasks</span>
                        </div>
                        <div className={styles.statValue}>{tasks.length}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Plus size={16} className={styles.statIcon} style={{ color: '#1c1c1e' }} />
                            </motion.div>
                            <span>Completed Today</span>
                        </div>
                        <div className={styles.statValue}>
                            {tasks.filter(t => t.completed && t.date && new Date(t.date).toDateString() === new Date().toDateString()).length}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <Clock size={16} className={styles.statIcon} style={{ color: '#ef4444' }} />
                            <span>Overdue</span>
                        </div>
                        <div className={styles.statValue}>
                            {tasks.filter(t => !t.completed && t.date && new Date(t.date) < new Date()).length}
                        </div>
                    </div>
                </div>
            </header>

            {view === 'list' && (
                <div className={styles.listView}>
                    <motion.button
                        whileHover={{ scale: 1.01, backgroundColor: 'var(--primary-light)' }}
                        whileTap={{ scale: 0.99 }}
                        className={styles.addTaskBtn}
                        onClick={() => {
                            setNewTaskDate(new Date());
                            setShowAddModal(true);
                        }}
                    >
                        <Plus size={20} />
                        <span>Add New Task</span>
                    </motion.button>

                    <div className={styles.list}>
                        {(() => {
                            const todayStr = new Date().toDateString();
                            const todayTasks = tasks.filter(t => !t.completed && t.date && new Date(t.date).toDateString() === todayStr);
                            const upcomingTasks = tasks.filter(t => !t.completed && (!t.date || new Date(t.date).toDateString() !== todayStr));
                            const completedTasks = tasks.filter(t => t.completed);

                            return (
                                <>
                                    {todayTasks.length > 0 && (
                                        <section className={styles.section}>
                                            <h2 className={styles.sectionTitle}>Today</h2>
                                            <AnimatePresence mode="popLayout">
                                                {todayTasks.map(task => (
                                                    <TaskItem
                                                        key={task.id}
                                                        task={task}
                                                        onToggle={handleToggle}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </section>
                                    )}

                                    {upcomingTasks.length > 0 && (
                                        <section className={styles.section}>
                                            <h2 className={styles.sectionTitle}>Upcoming</h2>
                                            <AnimatePresence mode="popLayout">
                                                {upcomingTasks.map(task => (
                                                    <TaskItem
                                                        key={task.id}
                                                        task={task}
                                                        onToggle={handleToggle}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </section>
                                    )}

                                    {completedTasks.length > 0 && (
                                        <section className={styles.section}>
                                            <h2 className={styles.sectionTitle}>Completed</h2>
                                            <AnimatePresence mode="popLayout">
                                                {completedTasks.map(task => (
                                                    <TaskItem
                                                        key={task.id}
                                                        task={task}
                                                        onToggle={handleToggle}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </section>
                                    )}
                                </>
                            );
                        })()}

                        {tasks.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={styles.emptyState}
                            >
                                <div className={styles.emptyIcon}>✨</div>
                                <p>All clear! Time to relax or add a new task.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {view === 'calendar' && (
                <CalendarView
                    tasks={tasks}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    onAddTask={(date: Date) => {
                        setNewTaskDate(date);
                        setShowAddModal(true);
                    }}
                />
            )}

            {view === 'timeline' && (
                <TimelineView
                    tasks={tasks}
                    currentDate={currentDate}
                    onAddTask={(date: Date) => {
                        setNewTaskDate(date);
                        setShowAddModal(true);
                    }}
                    onTaskClick={(task: Task) => {
                        console.log('Task clicked:', task);
                    }}
                    onToggleTask={handleToggle}
                    onDeleteTask={handleDelete}
                />
            )}

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={styles.modal}
                        >
                            <div className={styles.modalHeader}>
                                <h2>New Task</h2>
                                <button onClick={() => setShowAddModal(false)} className={styles.closeBtn}><X size={20} /></button>
                            </div>
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className={styles.modalInput}
                                autoFocus
                            />
                            <div className={styles.pickerContainer}>
                                <DateTimePicker
                                    key={newTaskDate.getTime()}
                                    initialDate={newTaskDate}
                                    onSave={handleAddTask}
                                    onCancel={() => setShowAddModal(false)}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tasks;
