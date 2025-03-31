// src/types/index.ts
export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'finance' | 'projects';

export type TaskStatus = 'active' | 'completed';

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: string; // ISO date string
  createdDate: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  rolloverCount?: number; // Number of days rolled over
  subtasks?: SubTask[];
  streakCount?: number; // For streak tracking tasks
};

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type MindMapNode = {
  id: string;
  x?: number;
  y?: number;
  name: string;
  type: 'central' | 'category' | 'task';
  category?: TaskCategory;
  taskId?: string;
  status?: TaskStatus;
  rolloverCount?: number;
  streakCount?: number;
};

export type MindMapLink = {
  source: string;
  target: string;
};