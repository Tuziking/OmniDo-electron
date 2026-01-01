import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { isPast } from 'date-fns';
import styles from './TaskItem.module.css';
import { Task } from '../types/task';
import { Trash2, AlertCircle, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import TaskDeadline from './TaskDeadline';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onClick?: (task: Task) => void;
    onUpdate?: (task: Task) => void;
}

const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(({ task, onToggle, onDelete, onClick, onUpdate }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.status === 'done').length;
    const hasSubtasks = subtasks.length > 0;

    const handleToggleSubtask = (e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        if (!onUpdate) return;

        const updatedSubtasks = subtasks.map(s =>
            s.id === subtaskId ? { ...s, status: s.status === 'done' ? 'todo' : 'done' as any } : s
        );
        onUpdate({ ...task, subtasks: updatedSubtasks });
    };

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${styles.item} ${task.completed ? styles.completed : ''} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => onClick && onClick(task)}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className={styles.mainContent}>
                <div className={styles.left}>
                    <motion.input
                        whileTap={{ scale: 0.8 }}
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggle(task.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.checkbox}
                    />
                    <div className={styles.content}>
                        <div className={styles.titleRow}>
                            <span className={styles.title}>{task.title}</span>
                            {task.priority && task.priority >= 1 && (
                                <div className={`${styles.priorityTag} ${task.priority === 3 ? styles.high :
                                    task.priority === 2 ? styles.medium : styles.low
                                    }`}>
                                    <AlertCircle size={10} />
                                    <span>{
                                        task.priority === 3 ? 'High' :
                                            task.priority === 2 ? 'Medium' : 'Low'
                                    }</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.meta}>
                            {task.date && (
                                <div className={`${styles.deadline} ${isPast(task.date) && !task.completed ? styles.overdue : ''}`}>
                                    <TaskDeadline date={task.date} completed={task.completed} />
                                </div>
                            )}
                            {hasSubtasks && (
                                <div
                                    className={styles.subtaskSummary}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                >
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    <span>{completedSubtasks}/{subtasks.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.right}>
                    <motion.button
                        whileHover={{ scale: 1.1, color: '#ef4444' }}
                        whileTap={{ scale: 0.9 }}
                        className={styles.deleteBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                    >
                        <Trash2 size={16} />
                    </motion.button>
                </div>
            </div>

            {hasSubtasks && isExpanded && (
                <div className={styles.subtaskList}>
                    {subtasks.map(subtask => (
                        <div
                            key={subtask.id}
                            className={`${styles.subtask} ${subtask.status === 'done' ? styles.subtaskDone : ''}`}
                            onClick={(e) => handleToggleSubtask(e, subtask.id)}
                        >
                            {subtask.status === 'done' ? (
                                <CheckCircle2 size={14} className={styles.subtaskCheck} />
                            ) : (
                                <Circle size={14} className={styles.subtaskCircle} />
                            )}
                            <span>{subtask.title || 'Untitled subtask'}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
});

export default TaskItem;
