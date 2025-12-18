import React, { useRef, useState } from 'react';
import { format, addDays, startOfDay, isSameDay, eachDayOfInterval, isToday, isPast, isTomorrow, subDays, formatDistanceToNowStrict } from 'date-fns';
import { Plus, Clock, Trash2, CheckCircle, Circle, Eye, EyeOff } from 'lucide-react';
import styles from './TimelineView.module.css';

interface Task {
    id: string;
    title: string;
    startTime?: string;
    duration?: number;
    color?: string;
    date?: Date;
    completed: boolean;
}

interface TimelineViewProps {
    tasks: Task[];
    currentDate: Date;
    onAddTask: (date: Date) => void;
    onTaskClick: (task: Task) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks, currentDate, onAddTask, onTaskClick, onToggleTask, onDeleteTask }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showPast, setShowPast] = useState(false);

    // Determine date range
    const today = startOfDay(currentDate);
    const startDate = showPast ? subDays(today, 7) : today;
    const endDate = addDays(today, 14);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    console.log('TimelineView Debug:', {
        tasksCount: tasks.length,
        currentDate,
        startDate,
        endDate,
        sampleTaskDate: tasks[0]?.date,
        tasksWithDates: tasks.filter(t => t.date).length,
        tasksInWindow: tasks.filter(t => t.date && t.date >= startDate && t.date <= endDate).length
    });

    return (
        <div className={styles.container} ref={scrollRef}>
            <div className={styles.headerActions}>
                <button
                    className={styles.addTaskBtnHeader}
                    onClick={() => onAddTask(new Date())}
                >
                    <Plus size={16} />
                    <span>Add Task</span>
                </button>
                <button
                    className={styles.togglePastBtn}
                    onClick={() => setShowPast(!showPast)}
                >
                    {showPast ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPast ? 'Hide Past Days' : 'Show Past Days'}
                </button>
            </div>

            <div className={styles.timelineTrack}>
                {days.map((day) => {
                    const dayTasks = tasks
                        .filter(t => t.date && isSameDay(t.date, day))
                        .sort((a, b) => {
                            // Sort by completion status first (uncompleted first)
                            if (a.completed !== b.completed) return a.completed ? 1 : -1;
                            // Then by start time if available
                            if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
                            return 0;
                        });
                    const isCurrentDay = isToday(day);

                    let dateLabel = format(day, 'MMMM d');
                    if (isCurrentDay) dateLabel = 'Today';
                    else if (isTomorrow(day)) dateLabel = 'Tomorrow';

                    if (dayTasks.length === 0) return null;

                    return (
                        <div key={day.toString()} className={`${styles.dayBlock} ${isCurrentDay ? styles.todayBlock : ''}`}>
                            <div className={styles.dayDot}></div>
                            <div className={styles.dayHeader}>
                                <div className={styles.dateLabel}>
                                    <span className={`${styles.dayName} ${isCurrentDay ? styles.accentText : ''}`}>{dateLabel}</span>
                                    <span className={styles.fullDate}>{format(day, 'EEEE, yyyy')}</span>
                                </div>
                            </div>

                            <div className={styles.contentArea}>
                                <div className={styles.tasksContainer}>
                                    {dayTasks.map(task => (
                                        <div key={task.id} className={styles.taskWrapper}>
                                            <span className={styles.taskTime}>{task.startTime || 'All Day'}</span>

                                            <div
                                                className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
                                                onClick={() => onTaskClick(task)}
                                            >
                                                <button
                                                    className={styles.checkBtn}
                                                    onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                                                >
                                                    {task.completed ? <CheckCircle size={22} className={styles.checkedIcon} /> : <Circle size={22} />}
                                                </button>

                                                <div className={styles.taskContent}>
                                                    <span className={styles.taskTitle}>{task.title}</span>

                                                    <div className={styles.taskMeta}>
                                                        {task.date && (
                                                            <span className={`${styles.taskDDL} ${isPast(task.date) && !task.completed ? styles.overdue : ''}`}>
                                                                <Clock size={14} />
                                                                {isPast(task.date) && !task.completed ? 'Overdue by ' : 'Due in '}
                                                                {formatDistanceToNowStrict(task.date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineView;
