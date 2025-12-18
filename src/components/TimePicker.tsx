import React from 'react';
import styles from './TimePicker.module.css';

interface TimePickerProps {
    value: string; // HH:mm
    onChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
    const [hours, minutes] = value.split(':').map(Number);

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newHour = e.target.value.padStart(2, '0');
        onChange(`${newHour}:${minutes.toString().padStart(2, '0')}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMinute = e.target.value.padStart(2, '0');
        onChange(`${hours.toString().padStart(2, '0')}:${newMinute}`);
    };

    return (
        <div className={styles.container}>
            <select value={hours} onChange={handleHourChange} className={styles.select}>
                {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                ))}
            </select>
            <span className={styles.separator}>:</span>
            <select value={minutes} onChange={handleMinuteChange} className={styles.select}>
                {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                ))}
            </select>
        </div>
    );
};

export default TimePicker;
