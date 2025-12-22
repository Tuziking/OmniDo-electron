import React, { useState, useEffect } from 'react';
import { isPast, differenceInHours } from 'date-fns';
import { getRelativeTimeDetailed, getRelativeTimeWithSeconds } from '../utils/dateUtils';

interface TaskDeadlineProps {
    date: Date | string;
    completed: boolean;
}

const TaskDeadline: React.FC<TaskDeadlineProps> = ({ date, completed }) => {
    const [timeString, setTimeString] = useState<string>('');

    useEffect(() => {
        const calculateTime = () => {
            const targetDate = new Date(date);
            const now = new Date();
            const hoursDiff = Math.abs(differenceInHours(targetDate, now));

            // Ticking if within 24 hours (and not completed? actually maybe stick to ticking regardless for consistency if users want to see exactly how late they are? 
            // The prompt says "Only when hours are shown", which implies near tasks.
            // Let's stick to < 24h.

            const near = hoursDiff < 24;
            if (near) {
                setTimeString(getRelativeTimeWithSeconds(targetDate));
            } else {
                setTimeString(getRelativeTimeDetailed(targetDate));
            }
        };

        calculateTime();

        // If near, update every second. If not, maybe every minute or just once?
        // Let's check every second if near, otherwise check every minute to see if it BECAME near.

        const intervalId = setInterval(calculateTime, 1000);

        return () => clearInterval(intervalId);
    }, [date, completed]);

    const prefix = isPast(new Date(date)) && !completed ? 'Overdue by ' : 'Due in ';

    return (
        <span>
            {prefix}
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{timeString}</span>
        </span>
    );
};

export default TaskDeadline;
