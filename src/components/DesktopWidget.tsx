import React, { useState, useEffect } from 'react';
import { useStorage } from '../hooks/useStorage';
import styles from './DesktopWidget.module.css';
import { Task } from '../types/task';
import { Sparkles, Calendar } from 'lucide-react';

const DesktopWidget: React.FC = () => {
    const [tasks] = useStorage<Task[]>('omnido_tasks', []);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayStr = new Date().toDateString();
    const urgentTask = tasks
        .filter(t => !t.completed && t.date && new Date(t.date).toDateString() === todayStr)
        .sort((a, b) => {
            const priorityA = a.priority || 1;
            const priorityB = b.priority || 1;
            if (priorityA !== priorityB) return priorityB - priorityA;
            return (a.startTime || '23:59').localeCompare(b.startTime || '23:59');
        })[0];

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.widgetContainer}>
            <div className={styles.dragHandle} />

            <div className={styles.header}>
                <span className={styles.title}>OmniDo</span>
                <Sparkles size={14} style={{ opacity: 0.3 }} />
            </div>

            <div className={styles.clockSection}>
                <div className={styles.time}>{formatTime(currentTime)}</div>
                <div className={styles.date}>{formatDate(currentTime)}</div>
            </div>

            <div className={styles.taskSection}>
                <div className={styles.sectionTitle}>Focus Next</div>
                {urgentTask ? (
                    <div className={styles.urgentTask}>
                        <div className={styles.taskHeader}>
                            <div className={`${styles.badge} ${styles[`priority${urgentTask.priority || 1}`]}`}>
                                {urgentTask.priority === 3 ? 'High' : urgentTask.priority === 2 ? 'Medium' : 'Low'}
                            </div>
                            <span className={styles.taskTitle}>{urgentTask.title}</span>
                        </div>
                        <div className={styles.taskMeta}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.4, fontSize: '11px' }}>
                                <Calendar size={12} />
                                <span>{urgentTask.startTime || 'No time set'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: '32px' }}>✨</div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>All tasks complete for today</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesktopWidget;
