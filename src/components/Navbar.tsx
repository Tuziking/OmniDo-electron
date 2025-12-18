import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, CheckSquare, Folder, Activity, Lightbulb } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
    return (
        <header className={styles.navbar}>
            <div className={styles.logo}>
                {/* Assuming logo.png is in public folder, same as Sidebar */}
                <img src="./logo.png" alt="OmniDo" />
                <span>OmniDo</span>
            </div>
            <nav className={styles.nav}>
                <NavLink to="/focus" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Target />
                    <span>Focus</span>
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <CheckSquare />
                    <span>Tasks</span>
                </NavLink>
                <NavLink to="/projects" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Folder />
                    <span>Projects</span>
                </NavLink>
                <NavLink to="/habits" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Activity />
                    <span>Habits</span>
                </NavLink>
                <NavLink to="/inspiration" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Lightbulb />
                    <span>Inspiration</span>
                </NavLink>
            </nav>
            {/* Placeholder for right side items if any, maybe settings or profile */}

        </header>
    );
};

export default Navbar;
