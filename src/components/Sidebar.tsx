import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, CheckSquare, Folder, Activity, Lightbulb, Monitor } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    const toggleWidget = () => {
        if (window.ipcRenderer) {
            window.ipcRenderer.send('toggle-widget');
        }
    };

    return (
        <div className={`${styles.sidebar} drag-region`}>
            <div className={styles.logo}>
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

            <div className={styles.bottomActions}>
                <button className={styles.link} onClick={toggleWidget} title="Toggle Desktop Widget">
                    <Monitor size={24} strokeWidth={1.5} />
                    <span>Widget</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
