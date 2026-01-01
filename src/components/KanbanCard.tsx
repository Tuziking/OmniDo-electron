import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare, List } from 'lucide-react';
import styles from './Kanban.module.css';

import { Task, TaskStatus } from '../types/task';

interface KanbanCardProps {
    task: Task;
    onClick: (task: Task) => void;
    onUpdate?: (task: Task) => void;
}

const COLORS = {
    'todo': { border: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' }, // Blue
    'in-progress': { border: '#f59e0b', bg: '#fffbeb', text: '#b45309' }, // Amber
    'done': { border: '#10b981', bg: '#ecfdf5', text: '#047857' } // Emerald
};

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick, onUpdate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: { task }
    });

    const colorConfig = (task.status && COLORS[task.status]) || COLORS['todo'];

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        borderColor: isDragging ? colorConfig.border : 'transparent',
        backgroundColor: isDragging ? colorConfig.bg : '#ffffff',
    };

    const completedSubtasks = (task.subtasks || []).filter(t => t.status === 'done').length;
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleToggleSubtasks = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleSubtaskToggle = (e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (!onUpdate) return;

        const updatedSubtasks = (task.subtasks || []).map(sub => {
            if (sub.id === subtaskId) {
                const newStatus: TaskStatus = sub.status === 'done' ? 'todo' : 'done';
                return { ...sub, status: newStatus, completed: newStatus === 'done' };
            }
            return sub;
        });

        onUpdate({ ...task, subtasks: updatedSubtasks });
    };

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // If click is on interactive elements (subtasks, badges) or their children, don't trigger card click
        // Using data attributes for reliable detection since CSS module class names are hashed
        if (target.closest('[data-subtask-container]') || target.closest('[data-subtask-item]') || target.closest('[data-subtask-badge]')) {
            return;
        }
        onClick(task);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
        >
            <div
                className={styles.cardTitle}
                {...listeners}
                onClick={handleCardClick}
            >
                {task.title}
            </div>

            <div
                className={styles.cardFooter}
                {...listeners}
            >
                <div
                    className={styles.subtaskBadge}
                    data-subtask-badge
                    onClick={task.subtasks && task.subtasks.length > 0 ? handleToggleSubtasks : undefined}
                >
                    {task.subtasks && task.subtasks.length > 0 ? (
                        <>
                            <List size={12} />
                            <span>{completedSubtasks}/{task.subtasks.length}</span>
                        </>
                    ) : (
                        <CheckSquare size={12} />
                    )}
                </div>
            </div>

            {task.subtasks && task.subtasks.length > 0 && isExpanded && (
                <div
                    className={styles.subtaskListDropdown}
                    data-subtask-container
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    onMouseDown={(e) => { e.stopPropagation(); }}
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    onTouchStart={(e) => { e.stopPropagation(); }}
                >
                    {task.subtasks.map(sub => (
                        <div
                            key={sub.id}
                            data-subtask-item
                            className={`${styles.subtaskCardItem} ${sub.status === 'done' ? styles.done : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleSubtaskToggle(e, sub.id);
                            }}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onPointerDown={(e) => { e.stopPropagation(); }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={`${styles.subtaskDot} ${sub.status === 'done' ? styles.done : ''}`}></div>
                            <span>{sub.title || 'Untitled'}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(KanbanCard);
