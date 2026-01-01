import React, { useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DndContext, DragOverlay, DragEndEvent, DragOverEvent, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import TaskDetailModal from '../components/TaskDetailModal';
import styles from './ProjectDetails.module.css';
import kanbanStyles from '../components/Kanban.module.css';

import { Task, TaskStatus } from '../types/task';

const ProjectDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock project lookup
    const projects = [
        { id: '1', title: 'Personal' },
        { id: '2', title: 'Work' },
        { id: '3', title: 'Learning' },
        { id: '4', title: 'Fitness' },
    ];
    const project = projects.find(p => p.id === id) || { title: 'Project Details' };

    const [tasks, setTasks] = useStorage<Task[]>(`omnido_project_tasks_${id || 'default'}`, []);

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: any) => {
        setActiveTask(event.active.data.current.task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.task;
        const isOverTask = over.data.current?.task;

        if (!isActiveTask) return;

        // Dropping over a column
        if (!isOverTask) {
            const overColumnId = over.id as 'todo' | 'in-progress' | 'done';
            if (isActiveTask.status !== overColumnId) {
                setTasks((tasks) => {
                    const activeIndex = tasks.findIndex(t => t.id === activeId);
                    if (activeIndex === -1) return tasks;

                    const newTasks = [...tasks];
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        status: overColumnId,
                        completed: overColumnId === 'done'
                    };
                    return newTasks;
                });
            }
            return;
        }

        // Dropping over another task
        if (isActiveTask.status !== isOverTask.status) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const overIndex = tasks.findIndex(t => t.id === overId);

                if (activeIndex === -1 || overIndex === -1) return tasks;

                const newTasks = [...tasks];
                // Change status first
                newTasks[activeIndex] = {
                    ...newTasks[activeIndex],
                    status: isOverTask.status,
                    completed: isOverTask.status === 'done'
                };

                // Then move to new position
                return arrayMove(newTasks, activeIndex, overIndex);
            });
        } else {
            // Reordering within same column during drag (optional but good for smoothness)
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const overIndex = tasks.findIndex(t => t.id === overId);

                if (activeIndex !== overIndex) {
                    return arrayMove(tasks, activeIndex, overIndex);
                }
                return tasks;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Reordering within same column or final position
        setTasks((tasks) => {
            const oldIndex = tasks.findIndex(t => t.id === activeId);
            const newIndex = tasks.findIndex(t => t.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                return arrayMove(tasks, oldIndex, newIndex);
            }
            return tasks;
        });
    };

    const handleAddTask = (status: TaskStatus) => {
        const newTask: Task = {
            id: Date.now().toString(),
            title: 'New Task',
            status,
            completed: status === 'done',
            subtasks: []
        };
        setTasks([...tasks, newTask]);
        setSelectedTask(newTask); // Open modal immediately
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        if (selectedTask && selectedTask.id === updatedTask.id) {
            setSelectedTask(updatedTask);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
        setSelectedTask(null);
    };

    const columns = [
        { id: 'todo', title: 'To Do' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'done', title: 'Done' },
    ];



    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/projects')}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <div className={styles.actions}>
                    <button className={styles.actionBtn}>Share</button>
                </div>
            </header>

            <div className={styles.content}>
                <h1 className={styles.title}>{project.title}</h1>
                <p className={styles.description}>
                    Manage your project tasks with this Kanban board. Drag and drop to update status.
                </p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className={kanbanStyles.board}>
                        {columns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                tasks={tasks.filter(t => t.status === col.id)}
                                onTaskClick={setSelectedTask}
                                onAddTask={handleAddTask}
                                onUpdateTask={handleUpdateTask}
                            />
                        ))}
                    </div>

                    <DragOverlay dropAnimation={null}>
                        {activeTask ? (
                            <KanbanCard
                                task={tasks.find(t => t.id === activeTask.id) || activeTask}
                                onClick={() => { }}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            )}
        </div>
    );
};

export default ProjectDetails;
