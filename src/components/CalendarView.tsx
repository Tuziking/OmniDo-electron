import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CalendarView.module.css';

interface Task {
    id: string;
    title: string;
    date?: Date;
    completed: boolean;
}

interface CalendarViewProps {
    tasks: Task[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onAddTask: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, currentDate, onDateChange, onAddTask }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;

            const dayTasks = tasks.filter(task =>
                task.date &&
                isSameDay(task.date, cloneDay) &&
                !task.completed
            );

            days.push(
                <div
                    className={`${styles.col} ${!isSameMonth(day, monthStart)
                        ? styles.disabled
                        : ''
                        } ${isSameDay(day, new Date()) ? styles.today : ''} ${isSameDay(day, currentDate) ? styles.selected : ''}`}
                    key={day.toString()}
                    onClick={() => {
                        onDateChange(cloneDay);
                        onAddTask(cloneDay);
                    }}
                >
                    <span className={styles.number}>{formattedDate}</span>
                    <div className={styles.taskContainer}>
                        {dayTasks.map(task => (
                            <div key={task.id} className={styles.taskDot} title={task.title}>
                                {task.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className={styles.row} key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    const nextMonth = () => {
        onDateChange(addMonths(currentDate, 1));
    };

    const prevMonth = () => {
        onDateChange(subMonths(currentDate, 1));
    };

    return (
        <div className={styles.calendar}>
            <div className={styles.header}>
                <div className={styles.colStart}>
                    <span className={styles.monthLabel}>
                        {format(currentDate, "MMMM yyyy")}
                    </span>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={20} /></button>
                    <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className={styles.daysRow}>
                {weekDays.map(d => (
                    <div className={styles.col} key={d}>
                        {d}
                    </div>
                ))}
            </div>
            <div className={styles.body}>{rows}</div>
        </div>
    );
};

export default CalendarView;
