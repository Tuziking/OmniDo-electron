import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import styles from './Kanban.module.css';

import { Task, TaskStatus } from '../types/task';

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onAddTask: (status: TaskStatus) => void;
    onUpdateTask: (updatedTask: Task) => void;
}

const COLORS = {
    'todo': { border: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' }, // Blue
    'in-progress': { border: '#f59e0b', bg: '#fffbeb', text: '#b45309' }, // Amber
    'done': { border: '#10b981', bg: '#ecfdf5', text: '#047857' } // Emerald
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onTaskClick, onAddTask, onUpdateTask }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    });

    const colorConfig = COLORS[id as keyof typeof COLORS] || COLORS['todo'];

    return (
        <div
            className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
            style={{
                borderColor: isOver ? colorConfig.border : 'transparent',
                backgroundColor: isOver ? colorConfig.bg : '#f9fafb'
            }}
        >
            <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                    <div
                        className={styles.statusDot}
                        style={{ backgroundColor: colorConfig.border }}
                    />
                    {title}
                    <span
                        className={styles.taskCount}
                        style={{
                            backgroundColor: colorConfig.bg,
                            color: colorConfig.text
                        }}
                    >
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div ref={setNodeRef} className={styles.columnContent}>
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onClick={onTaskClick}
                            onUpdate={onUpdateTask}
                        />
                    ))}
                </SortableContext>
            </div>

            <button
                className={styles.addBtn}
                onClick={() => onAddTask(id as TaskStatus)}
            >
                <Plus size={16} />
                Add Task
            </button>
        </div>
    );
};

export default React.memo(KanbanColumn);
