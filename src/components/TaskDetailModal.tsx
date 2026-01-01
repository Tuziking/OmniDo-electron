import React, { useState } from 'react';
import { X, Plus, Trash2, CheckSquare, Square, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import DateTimePicker from './DateTimePicker';
import styles from './Kanban.module.css';
import { formatLocalTime } from '../utils/dateUtils';

import { Task, TaskPriority } from '../types/task';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
    onDelete: (taskId: string) => void;
}

interface SubtaskListProps {
    tasks: Task[];
    onUpdateSubtask: (subtaskId: string, updates: Partial<Task>) => void;
    onDeleteSubtask: (subtaskId: string) => void;
    onEnterPressed: () => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ tasks, onUpdateSubtask, onDeleteSubtask, onEnterPressed }) => {
    return (
        <div className={styles.subtaskList}>
            {tasks.map(subtask => (
                <div key={subtask.id} className={styles.subtaskItem}>
                    <div
                        className={styles.subtaskCheckbox}
                        onClick={() => onUpdateSubtask(subtask.id, { status: subtask.status === 'done' ? 'todo' : 'done' })}
                    >
                        {subtask.status === 'done' ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <input
                        className={styles.subtaskInput}
                        value={subtask.title}
                        onChange={(e) => onUpdateSubtask(subtask.id, { title: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onEnterPressed();
                            }
                        }}
                        style={{ textDecoration: subtask.status === 'done' ? 'line-through' : 'none', color: subtask.status === 'done' ? '#9ca3af' : 'inherit' }}
                        placeholder="New subtask..."
                        autoFocus
                    />
                    <button
                        className={styles.closeBtn}
                        onClick={() => onDeleteSubtask(subtask.id)}
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(task.title);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        onUpdate({ ...task, title: e.target.value });
    };

    const handleAddSubtask = () => {
        const newSubtask: Task = {
            id: Date.now().toString(),
            title: '',
            status: 'todo',
            completed: false,
            subtasks: []
        };
        onUpdate({
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask]
        });
    };

    const handleUpdateSubtask = (subtaskId: string, updates: Partial<Task>) => {
        onUpdate({
            ...task,
            subtasks: (task.subtasks || []).map(t => t.id === subtaskId ? { ...t, ...updates } : t)
        });
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        onUpdate({
            ...task,
            subtasks: (task.subtasks || []).filter(t => t.id !== subtaskId)
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <input
                        className={styles.modalTitleInput}
                        value={title}
                        onChange={handleTitleChange}
                    />
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.modalContent}>
                    <div className={styles.propertiesGrid}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.sectionTitle}>Priority</div>
                            <div className={styles.prioritySelector}>
                                {([1, 2, 3] as TaskPriority[]).map(p => (
                                    <button
                                        key={p}
                                        className={`${styles.priorityBtn} ${task.priority === p ? styles[`priority${p}`] : ''}`}
                                        onClick={() => onUpdate({ ...task, priority: p })}
                                    >
                                        <AlertCircle size={14} />
                                        {p === 1 ? 'Low' : p === 2 ? 'Medium' : 'High'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.propertyGroup}>
                            <div className={styles.sectionTitle}>Due Date</div>
                            <button
                                className={styles.dateBtn}
                                onClick={() => setShowDatePicker(true)}
                            >
                                <Calendar size={16} />
                                <span>
                                    {task.date
                                        ? format(new Date(task.date), 'MMM d, yyyy HH:mm')
                                        : 'Set due date'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {showDatePicker && (
                        <div className={styles.datePickerContainer}>
                            <DateTimePicker
                                initialDate={task.date ? new Date(task.date) : new Date()}
                                onSave={(date) => {
                                    onUpdate({
                                        ...task,
                                        date: date,
                                        startTime: formatLocalTime(date)
                                    });
                                    setShowDatePicker(false);
                                }}
                                onCancel={() => setShowDatePicker(false)}
                            />
                        </div>
                    )}

                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Subtasks</div>
                        <SubtaskList
                            tasks={task.subtasks || []}
                            onUpdateSubtask={handleUpdateSubtask}
                            onDeleteSubtask={handleDeleteSubtask}
                            onEnterPressed={handleAddSubtask}
                        />
                        <button className={styles.addSubtaskBtn} onClick={handleAddSubtask}>
                            <Plus size={16} /> Add Subtask
                        </button>
                    </div>


                    <button
                        className={styles.deleteBtn}
                        onClick={() => {
                            if (window.confirm('Delete this task?')) {
                                onDelete(task.id);
                                onClose();
                            }
                        }}
                    >
                        <Trash2 size={16} style={{ marginRight: 8 }} />
                        Delete Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
