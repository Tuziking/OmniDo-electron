import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Flame, Calendar, Trophy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './HabitDetails.module.css';
import { formatLocalDate } from '../utils/dateUtils';

interface Habit {
    id: string;
    title: string;
    streak: number;
    goal: number;
    progress: number;
    startDate: string;
    history: Record<string, number>;
}

const HabitDetails: React.FC = () => {
    useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    const habit = state as Habit;

    if (!habit) {
        return (
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={styles.error}
                >
                    <p>Habit not found. Please try again from the list.</p>
                    <button className={styles.backBtn} onClick={() => navigate('/habits')}>
                        Back to Habits
                    </button>
                </motion.div>
            </div>
        );
    }

    const getDayLevel = (date: Date | null) => {
        if (!date) return 'empty';
        const dateStr = formatLocalDate(date);
        const progress = habit.history?.[dateStr] || 0;

        if (progress === 0) return 'level0';

        const percentage = progress / habit.goal;
        if (percentage >= 1) return 'level4';
        if (percentage >= 0.75) return 'level3';
        if (percentage >= 0.5) return 'level2';
        return 'level1';
    };

    const getYearlyData = () => {
        const days = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            days.push(d);
        }
        return days;
    };

    const getAllMonthsSinceStart = () => {
        const months = [];
        const today = new Date();
        const start = habit.startDate ? new Date(habit.startDate) : new Date();

        let current = new Date(today.getFullYear(), today.getMonth(), 1);
        const endMonth = start.getMonth();
        const endYear = start.getFullYear();

        while (current.getFullYear() > endYear || (current.getFullYear() === endYear && current.getMonth() >= endMonth)) {
            months.push(new Date(current));
            current.setMonth(current.getMonth() - 1);
        }
        return months;
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const yearlyData = getYearlyData();
    const allMonths = getAllMonthsSinceStart();
    const totalCompletions = Object.keys(habit.history || {}).filter(d => habit.history[d] >= habit.goal).length;

    const getMonthLabels = () => {
        const labels: { name: string, offset: number }[] = [];
        let currentMonth = -1;
        yearlyData.forEach((date, i) => {
            if (date.getDate() === 1 && date.getMonth() !== currentMonth) {
                labels.push({
                    name: date.toLocaleString('default', { month: 'short' }),
                    offset: i
                });
                currentMonth = date.getMonth();
            }
        });
        return labels;
    };

    const monthLabels = getMonthLabels();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={styles.container}
        >
            <motion.header variants={itemVariants} className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/habits')}>
                    <ArrowLeft size={16} />
                    <span>Habits</span>
                </button>
                <div className={styles.todayIndicator}>
                    <Calendar size={14} />
                    Today: {formatLocalDate(new Date())}
                </div>
            </motion.header>

            <motion.div variants={itemVariants} className={styles.mainInfo}>
                <div>
                    <h1 className={styles.title}>{habit.title}</h1>
                    <div className={styles.metaInfo}>
                        <div className={styles.startDateTag}>
                            {habit.startDate || 'Unknown'} Start
                        </div>
                        <span>Goal: {habit.goal} per day</span>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.statsGrid}>
                {[
                    { icon: <Flame size={24} color="var(--accent)" fill="#fef3c7" />, label: "Current Streak", value: habit.streak },
                    { icon: <Trophy size={24} color="#f59e0b" fill="#fef3c7" />, label: "Best Streak", value: habit.streak },
                    { icon: <Check size={24} color="var(--primary)" />, label: "Total Finished", value: totalCompletions }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className={styles.statCard}
                    >
                        <div className={styles.statValue}>
                            {stat.icon}
                            {stat.value}
                        </div>
                        <div className={styles.statLabel}>{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.section variants={itemVariants} className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Yearly Overview</h3>
                </div>
                <div className={styles.contributionWrapper}>
                    <div className={styles.monthLabels}>
                        {monthLabels.map((lbl, i) => (
                            <span key={i} className={styles.monthLabel} style={{ gridColumnStart: Math.floor(lbl.offset / 7) + 1 }}>
                                {lbl.name}
                            </span>
                        ))}
                    </div>
                    <div className={styles.contributionGrid}>
                        {yearlyData.map((date, i) => {
                            const level = getDayLevel(date);
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + (i * 0.001) }}
                                    className={`${styles.contributionCell} ${styles[level]}`}
                                    title={`${formatLocalDate(date)}: ${habit.history?.[formatLocalDate(date)] || 0}/${habit.goal}`}
                                ></motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.section>

            <motion.div variants={itemVariants} className={styles.verticalHistory}>
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3>Full History Timeline</h3>
                        <div className={styles.legend}>
                            <span>Less</span>
                            {['level0', 'level1', 'level2', 'level3', 'level4'].map(lvl => (
                                <div key={lvl} className={`${styles.legendItem} ${styles[lvl]}`}></div>
                            ))}
                            <span>More</span>
                        </div>
                    </div>

                    <div className={styles.historyMosaic}>
                        {allMonths.map((monthDate, mIdx) => (
                            <motion.div
                                key={mIdx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className={styles.miniMonth}
                            >
                                <div className={styles.miniMonthLabel}>
                                    {monthDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                </div>
                                <div className={styles.miniDotGrid}>
                                    {getDaysInMonth(monthDate).map((date, dIdx) => {
                                        const level = getDayLevel(date);
                                        const dateStr = date ? formatLocalDate(date) : '';
                                        const isToday = date && dateStr === formatLocalDate(new Date());
                                        const isBeforeStart = date && habit.startDate && dateStr < habit.startDate;
                                        const progress = date ? (habit.history?.[dateStr] || 0) : 0;
                                        const isCompleted = progress >= habit.goal;

                                        return (
                                            <motion.div
                                                key={dIdx}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: (mIdx * 0.05) + (dIdx * 0.005) }}
                                                className={`
                                                    ${styles.miniDot} 
                                                    ${styles[level]} 
                                                    ${isToday ? styles.today : ''}
                                                    ${isBeforeStart ? styles.dimmed : ''}
                                                `}
                                                title={date ? `${dateStr}: ${progress}/${habit.goal}${isBeforeStart ? ' (Before Start)' : ''}` : ''}
                                            >
                                                {date && isCompleted && !isBeforeStart && <Check size={8} className={styles.completed} />}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </motion.div>
        </motion.div>
    );
};

export default HabitDetails;
