import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DateTimePicker.module.css';

interface DateTimePickerProps {
    initialDate?: Date;
    onSave: (date: Date) => void;
    onCancel: () => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ initialDate, onSave, onCancel }) => {
    // 使用当前时间作为默认值（参考 Clock.tsx 的实现）
    const getInitialDate = () => initialDate || new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);
    const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(getInitialDate()));
    const [selectedHour, setSelectedHour] = useState<number>(() => getInitialDate().getHours());
    const [selectedMinute, setSelectedMinute] = useState<number>(() => getInitialDate().getMinutes());

    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const isProgrammaticScroll = useRef(false);
    const isInitialized = useRef(false);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleDateClick = (day: Date) => {
        const newDate = new Date(day);
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
        setSelectedDate(newDate);
    };



    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className={styles.calendar}>
                <div className={styles.calHeader}>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={styles.navBtn}><ChevronLeft size={16} /></button>
                    <span className={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={styles.navBtn}><ChevronRight size={16} /></button>
                </div>
                <div className={styles.weekDays}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className={styles.daysGrid}>
                    {days.map(day => (
                        <button
                            key={day.toString()}
                            className={`${styles.dayBtn} ${!isSameMonth(day, monthStart) ? styles.otherMonth : ''} ${isSameDay(day, selectedDate) ? styles.selectedDay : ''}`}
                            onClick={() => handleDateClick(day)}
                        >
                            {format(day, 'd')}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderTimePicker = () => {
        return (
            <div className={styles.timePicker}>
                <div className={styles.timeColumn}>
                    <div className={styles.timeLabel}>Hour</div>
                    <div
                        className={styles.scrollContainer}
                        ref={hoursRef}
                        onScroll={() => handleScroll('hour')}
                    >
                        {hours.map(h => (
                            <div
                                key={h}
                                className={`${styles.timeItem} ${h === selectedHour ? styles.selectedTime : ''}`}
                                onClick={() => scrollToIndexSmooth(hoursRef.current, h)}
                            >
                                {h.toString().padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.timeSeparator}>:</div>
                <div className={styles.timeColumn}>
                    <div className={styles.timeLabel}>Minute</div>
                    <div
                        className={styles.scrollContainer}
                        ref={minutesRef}
                        onScroll={() => handleScroll('minute')}
                    >
                        {minutes.map(m => (
                            <div
                                key={m}
                                className={`${styles.timeItem} ${m === selectedMinute ? styles.selectedTime : ''}`}
                                onClick={() => scrollToIndexSmooth(minutesRef.current, m)}
                            >
                                {m.toString().padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const handleScroll = (type: 'hour' | 'minute') => {
        // Don't handle scroll events during initialization or programmatic scrolling
        if (isProgrammaticScroll.current || !isInitialized.current) return;

        const container = type === 'hour' ? hoursRef.current : minutesRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.top + containerRect.height / 2;

        let closestIndex = 0;
        let minDistance = Infinity;

        const items = Array.from(container.children) as HTMLElement[];
        items.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(containerCenter - itemCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (type === 'hour') {
            if (closestIndex !== selectedHour) {
                setSelectedHour(closestIndex);
                const newDate = new Date(selectedDate);
                newDate.setHours(closestIndex);
                setSelectedDate(newDate);
            }
        } else {
            if (closestIndex !== selectedMinute) {
                setSelectedMinute(closestIndex);
                const newDate = new Date(selectedDate);
                newDate.setMinutes(closestIndex);
                setSelectedDate(newDate);
            }
        }
    };

    // Smooth scroll helper (keeps same centering calculation)
    const scrollToIndexSmooth = (container: HTMLDivElement | null, index: number) => {
        if (!container) return;

        const items = container.children;
        if (!items || items.length <= index) return;

        const targetItem = items[index] as HTMLElement;
        const containerHeight = container.clientHeight;
        const itemTop = targetItem.offsetTop;
        const itemHeight = targetItem.offsetHeight;

        const top = itemTop - (containerHeight / 2) + (itemHeight / 2);

        isProgrammaticScroll.current = true;
        container.scrollTo({ top, behavior: 'smooth' });

        // Re-enable after smooth animation (best-effort)
        setTimeout(() => {
            isProgrammaticScroll.current = false;
        }, 300);
    };

    // Sync state when initialDate prop changes and scroll to it
    // 组件挂载时也需要滚动到正确位置
    useEffect(() => {
        const dateToUse = initialDate || new Date();
        const hour = dateToUse.getHours();
        const minute = dateToUse.getMinutes();

        console.log('DateTimePicker init:', { hour, minute, dateToUse });

        // Mark as not initialized to prevent handleScroll from interfering
        isInitialized.current = false;
        isProgrammaticScroll.current = true;

        setSelectedHour(hour);
        setSelectedMinute(minute);
        setSelectedDate(dateToUse);

        // Wait for DOM to be ready, then scroll
        setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const scrollContainerTo = (container: HTMLDivElement | null, index: number) => {
                        if (!container) return;
                        const items = container.children;
                        if (!items || items.length <= index) return;

                        const targetItem = items[index] as HTMLElement;
                        // Dynamic calculation: Center the item
                        // scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2)
                        const containerHeight = container.clientHeight;
                        const itemTop = targetItem.offsetTop;
                        const itemHeight = targetItem.offsetHeight;

                        const targetScrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);

                        console.log('Dynamic scroll calc:', {
                            index,
                            containerHeight,
                            itemTop,
                            itemHeight,
                            targetScrollTop
                        });

                        container.scrollTop = targetScrollTop;
                    };

                    console.log('Scrolling to:', { hour, minute });

                    scrollContainerTo(hoursRef.current, hour);
                    scrollContainerTo(minutesRef.current, minute);

                    // Re-enable scroll handling after a delay
                    setTimeout(() => {
                        console.log('Final positions:', {
                            hour: selectedHour,
                            minute: selectedMinute,
                            hoursScrollTop: hoursRef.current?.scrollTop,
                            minutesScrollTop: minutesRef.current?.scrollTop
                        });

                        isProgrammaticScroll.current = false;
                        isInitialized.current = true;
                    }, 100);
                });
            });
        }, 0);
    }, [initialDate]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {renderCalendar()}
                <div className={styles.divider}></div>
                {renderTimePicker()}
            </div>
            <div className={styles.footer}>
                <div className={styles.selectedDisplay}>
                    {format(selectedDate, 'MMM d, yyyy HH:mm')}
                </div>
                <div className={styles.actions}>
                    <button onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
                    <button onClick={() => onSave(selectedDate)} className={styles.saveBtn}>Set Time</button>
                </div>
            </div>
        </div>
    );
};

export default DateTimePicker;
