import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, CheckSquare, Folder, Activity, Lightbulb } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <img src="./logo.png" alt="OmniDo" />
                <span>OmniDo</span>
            </div>
            <nav className={styles.nav}>
                <NavLink to="/focus" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link} data-tooltip="Focus">
                    <Target size={24} strokeWidth={1.5} />
                    <span>Focus</span>
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link} data-tooltip="Tasks">
                    <CheckSquare size={24} strokeWidth={1.5} />
                    <span>Tasks</span>
                </NavLink>
                <NavLink to="/projects" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link} data-tooltip="Projects">
                    <Folder size={24} strokeWidth={1.5} />
                    <span>Projects</span>
                </NavLink>
                <NavLink to="/habits" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link} data-tooltip="Habits">
                    <Activity size={24} strokeWidth={1.5} />
                    <span>Habits</span>
                </NavLink>
                <NavLink to="/inspiration" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link} data-tooltip="Inspiration">
                    <Lightbulb size={24} strokeWidth={1.5} />
                    <span>Inspiration</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
