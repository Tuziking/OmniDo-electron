import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, X, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Projects.module.css';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Project {
    id: string;
    title: string;
    taskCount: number;
    color: string;
}

const DEFAULT_PROJECTS: Project[] = [
    { id: '1', title: 'Personal', taskCount: 5, color: '#FF6B6B' },
    { id: '2', title: 'Work', taskCount: 12, color: '#4ECDC4' },
    { id: '3', title: 'Learning', taskCount: 3, color: '#FFE66D' },
    { id: '4', title: 'Fitness', taskCount: 2, color: '#1A535C' },
];

const Projects: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useLocalStorage<Project[]>('omnido_projects', DEFAULT_PROJECTS);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectTitle, setProjectTitle] = useState('');
    const [projectColor, setProjectColor] = useState('#FF6B6B');

    // Delete Confirmation State
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C', '#2EC4B6', '#E71D36', '#7209B7'];

    const handleAddClick = () => {
        setEditingProject(null);
        setProjectTitle('');
        setProjectColor(colors[0]);
        setIsModalOpen(true);
    };

    const handleEditClick = (project: Project) => {
        setEditingProject(project);
        setProjectTitle(project.title);
        setProjectColor(project.color);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            setProjects(projects.filter(p => p.id !== confirmDeleteId));
            setConfirmDeleteId(null);
        }
    };

    const handleSave = () => {
        if (!projectTitle.trim()) return;

        if (editingProject) {
            setProjects(projects.map(p =>
                p.id === editingProject.id
                    ? { ...p, title: projectTitle, color: projectColor }
                    : p
            ));
        } else {
            const newProject: Project = {
                id: Date.now().toString(),
                title: projectTitle,
                taskCount: 0,
                color: projectColor
            };
            setProjects([...projects, newProject]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >Projects</motion.h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={styles.addBtn}
                    onClick={handleAddClick}
                >
                    <Plus size={20} />
                    <span>New Project</span>
                </motion.button>
            </header>

            <motion.div
                className={styles.grid}
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                }}
            >
                <AnimatePresence mode="popLayout">
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <motion.div
                                key={project.id}
                                layout
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <ProjectCard
                                    project={project}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <EmptyState
                                icon={FolderPlus}
                                title="No projects yet"
                                description="Organize your tasks into projects to keep everything tidy and focused."
                                action={{
                                    label: "Create First Project",
                                    onClick: handleAddClick,
                                    icon: Plus
                                }}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={styles.modal}
                        >
                            <div className={styles.modalHeader}>
                                <h2>{editingProject ? 'Edit Project' : 'New Project'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.modalContent}>
                                <input
                                    type="text"
                                    placeholder="Project Name"
                                    value={projectTitle}
                                    onChange={(e) => setProjectTitle(e.target.value)}
                                    className={styles.modalInput}
                                    autoFocus
                                />
                                <div className={styles.colorPicker}>
                                    <span>Color</span>
                                    <div className={styles.colors}>
                                        {colors.map(color => (
                                            <motion.button
                                                key={color}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.8 }}
                                                className={`${styles.colorBtn} ${projectColor === color ? styles.activeColor : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setProjectColor(color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                >
                                    {editingProject ? 'Save Changes' : 'Create Project'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone and all tasks inside will be lost."
                confirmText="Delete Project"
                variant="danger"
            />
        </div>
    );
};

export default Projects;
