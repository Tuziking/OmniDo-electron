import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare, List } from 'lucide-react';
import styles from './Kanban.module.css';

interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    subtasks: Task[];
}

interface KanbanCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

const COLORS = {
    'todo': { border: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' }, // Blue
    'in-progress': { border: '#f59e0b', bg: '#fffbeb', text: '#b45309' }, // Amber
    'done': { border: '#10b981', bg: '#ecfdf5', text: '#047857' } // Emerald
};

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick }) => {
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

    const colorConfig = COLORS[task.status] || COLORS['todo'];

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        borderColor: isDragging ? colorConfig.border : 'transparent',
        backgroundColor: isDragging ? colorConfig.bg : '#ffffff',
    };

    const completedSubtasks = task.subtasks.filter(t => t.status === 'done').length;
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleToggleSubtasks = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
            onClick={() => onClick(task)}
        >
            <div className={styles.cardTitle}>{task.title}</div>

            <div className={styles.cardFooter}>
                <div
                    className={styles.subtaskBadge}
                    onClick={task.subtasks.length > 0 ? handleToggleSubtasks : undefined}
                >
                    {task.subtasks.length > 0 ? (
                        <>
                            <List size={12} />
                            <span>{completedSubtasks}/{task.subtasks.length}</span>
                        </>
                    ) : (
                        <CheckSquare size={12} />
                    )}
                </div>
            </div>

            {isExpanded && task.subtasks.length > 0 && (
                <div className={styles.subtaskListDropdown} onClick={(e) => e.stopPropagation()}>
                    {task.subtasks.map(sub => (
                        <div
                            key={sub.id}
                            className={`${styles.subtaskCardItem} ${sub.status === 'done' ? styles.done : ''}`}
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
