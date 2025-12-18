import React, { useState, useEffect } from 'react';
import styles from './Clock.module.css';

interface ClockProps {
    type?: 'analog' | 'digital';
}

const Clock: React.FC<ClockProps> = ({ type = 'digital' }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (type === 'digital') {
        return (
            <div className={styles.digitalClock}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        );
    }

    // Analog Clock Implementation
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondDegrees = ((seconds / 60) * 360) + 90;
    const minuteDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
    const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;

    return (
        <div className={styles.analogClock}>
            <div className={styles.outerFace}>
                <div className={styles.marker} style={{ transform: 'rotate(0deg)' }}></div>
                <div className={styles.marker} style={{ transform: 'rotate(90deg)' }}></div>
                <div className={styles.marker} style={{ transform: 'rotate(180deg)' }}></div>
                <div className={styles.marker} style={{ transform: 'rotate(270deg)' }}></div>

                <div className={styles.hand} style={{
                    height: '6px', width: '30%', background: '#333',
                    transform: `rotate(${hourDegrees}deg)`
                }}></div>
                <div className={styles.hand} style={{
                    height: '4px', width: '40%', background: '#666',
                    transform: `rotate(${minuteDegrees}deg)`
                }}></div>
                <div className={styles.hand} style={{
                    height: '2px', width: '45%', background: 'red',
                    transform: `rotate(${secondDegrees}deg)`
                }}></div>
                <div className={styles.centerDot}></div>
            </div>
        </div>
    );
};

export default Clock;
