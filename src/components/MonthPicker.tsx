import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import styles from './MonthPicker.module.css';

interface MonthPickerProps {
    currentDate: Date;
    onChange: (date: Date) => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ currentDate, onChange }) => {
    const nextMonth = () => onChange(addMonths(currentDate, 1));
    const prevMonth = () => onChange(subMonths(currentDate, 1));

    return (
        <div className={styles.container}>
            <button onClick={prevMonth} className={styles.btn}><ChevronLeft size={16} /></button>
            <span className={styles.label}>{format(currentDate, 'MMMM yyyy')}</span>
            <button onClick={nextMonth} className={styles.btn}><ChevronRight size={16} /></button>
        </div>
    );
};

export default MonthPicker;
