import React, { useRef, useState } from 'react';
import { format, addDays, startOfDay, isSameDay, eachDayOfInterval, isToday, isPast, isTomorrow, subDays } from 'date-fns';
import { Plus, Trash2, CheckCircle, Circle, Eye, EyeOff } from 'lucide-react';
import styles from './TimelineView.module.css';
import TaskDeadline from './TaskDeadline';

import { Task } from '../types/task';

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

    // Find the furthest task date
    const lastTaskDate = tasks.reduce((furthest, task) => {
        if (!task.date) return furthest;
        const taskDate = new Date(task.date);
        return taskDate > furthest ? taskDate : furthest;
    }, today);

    // Default to at least 30 days, or extend to cover the last task
    const minEndDate = addDays(today, 30);
    const endDate = lastTaskDate > minEndDate ? lastTaskDate : minEndDate;

    const startDate = showPast ? subDays(today, 7) : today;
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    console.log('TimelineView Debug:', {
        tasksCount: tasks.length,
        currentDate,
        startDate,
        endDate,
        sampleTaskDate: tasks[0]?.date,
        tasksWithDates: tasks.filter(t => t.date).length,
        tasksInWindow: tasks.filter(t => t.date && new Date(t.date) >= startDate && new Date(t.date) <= endDate).length
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
                        .filter(t => t.date && isSameDay(new Date(t.date), day))
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
                                                            <span className={`${styles.taskDDL} ${isPast(new Date(task.date)) && !task.completed ? styles.overdue : ''}`}>
                                                                <TaskDeadline date={task.date} completed={task.completed} />
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
