import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
        >
            <div className={styles.iconWrapper}>
                <Icon size={48} className={styles.icon} />
            </div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            {action && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={styles.actionBtn}
                    onClick={action.onClick}
                >
                    {action.icon && <action.icon size={18} style={{ marginRight: '8px' }} />}
                    <span>{action.label}</span>
                </motion.button>
            )}
        </motion.div>
    );
};

export default EmptyState;
