import React from 'react';
import { Trash2, Clock } from 'lucide-react';
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import styles from './TaskItem.module.css';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    date?: Date;
}

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${styles.item} ${task.completed ? styles.completed : ''}`}
        >
            <div className={styles.left}>
                <motion.input
                    whileTap={{ scale: 0.8 }}
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task.id)}
                    className={styles.checkbox}
                />
                <div className={styles.content}>
                    <span className={styles.title}>{task.title}</span>
                    {task.date && (
                        <div className={`${styles.deadline} ${isPast(task.date) && !task.completed ? styles.overdue : ''}`}>
                            <Clock size={12} />
                            <span>{formatDistanceToNowStrict(task.date, { addSuffix: true })}</span>
                        </div>
                    )}
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.1, color: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                className={styles.deleteBtn}
                onClick={() => onDelete(task.id)}
            >
                <Trash2 size={16} />
            </motion.button>
        </motion.div>
    );
};

export default TaskItem;
