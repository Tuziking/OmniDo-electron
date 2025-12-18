import React, { useState } from 'react';
import { X, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import styles from './Kanban.module.css';

interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    subtasks: Task[];
}

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
}

const SubtaskList: React.FC<SubtaskListProps> = ({ tasks, onUpdateSubtask, onDeleteSubtask }) => {
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        onUpdate({ ...task, title: e.target.value });
    };

    const handleAddSubtask = () => {
        const newSubtask: Task = {
            id: Date.now().toString(),
            title: '',
            status: 'todo',
            subtasks: []
        };
        onUpdate({
            ...task,
            subtasks: [...task.subtasks, newSubtask]
        });
    };

    const handleUpdateSubtask = (subtaskId: string, updates: Partial<Task>) => {
        onUpdate({
            ...task,
            subtasks: task.subtasks.map(t => t.id === subtaskId ? { ...t, ...updates } : t)
        });
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        onUpdate({
            ...task,
            subtasks: task.subtasks.filter(t => t.id !== subtaskId)
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
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Subtasks</div>
                        <SubtaskList
                            tasks={task.subtasks}
                            onUpdateSubtask={handleUpdateSubtask}
                            onDeleteSubtask={handleDeleteSubtask}
                        />
                        <button className={styles.addSubtaskBtn} onClick={handleAddSubtask}>
                            <Plus size={16} /> Add Subtask
                        </button>
                    </div>

                    <div style={{ flex: 1 }}></div>

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
