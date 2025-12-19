export type TaskPriority = 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    date?: Date | string;
    startTime?: string;
    duration?: number;
    priority?: TaskPriority;
    status?: TaskStatus;
    projectId?: string;
    subtasks?: Task[];
}
