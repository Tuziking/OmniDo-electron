export const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatLocalTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

import { differenceInCalendarDays, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

/**
 * Returns a detailed relative time string (e.g., "1d 4h", "5h 30m").
 * For durations > 3 days, returns simplified "Xd".
 */
export const getRelativeTimeDetailed = (date: Date | string): string => {
    const targetDate = new Date(date);
    const now = new Date();

    const diffInDays = differenceInCalendarDays(targetDate, now);
    const absDiff = Math.abs(diffInDays);

    // User requirement: "Simplified days-1 logic" but "near days need to show hours"
    // Hybrid approach:
    // If < 3 days (e.g. Today, Tomorrow, Day after tomorrow), show detailed breakdown (1d 4h, 5h 30m, etc.)
    // If >= 3 days, show simplified "days - 1" logic (date only)

    if (absDiff < 3) {
        // Detailed time logic
        const diffInMinutes = Math.abs(differenceInMinutes(targetDate, now));
        const diffInHours = Math.abs(differenceInHours(targetDate, now));
        const diffInDaysDetailed = Math.abs(differenceInDays(targetDate, now));

        if (diffInMinutes < 60) return `${diffInMinutes}m`;

        if (diffInHours < 24) {
            const remainingMinutes = diffInMinutes % 60;
            if (remainingMinutes === 0) return `${diffInHours}h`;
            return `${diffInHours}h ${remainingMinutes}m`;
        }

        const remainingHours = diffInHours % 24;
        if (remainingHours === 0) return `${diffInDaysDetailed}d`;
        return `${diffInDaysDetailed}d ${remainingHours}h`;
    }

    // Simplified "days - 1" logic for distant dates
    const displayedDays = Math.max(0, absDiff - 1);
    return `${displayedDays}d`;
};

export const getRelativeTimeWithSeconds = (date: Date | string): string => {
    const targetDate = new Date(date);
    const now = new Date();

    const diffInSeconds = Math.abs(differenceInSeconds(targetDate, now));
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    const seconds = diffInSeconds % 60;
    const minutes = diffInMinutes % 60;

    // Format: Xh Ym Zs
    if (diffInHours > 0) {
        return `${diffInHours}h ${minutes}m ${seconds}s`;
    }
    if (diffInMinutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};
