export type Page = 'home' | 'tasks' | 'inbox' | 'tracker';

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface InboxItem {
  id: string;
  content: string;
  processed: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekdays';
  completedDates: string[]; // ['2026-11-02', ...]
  streak: number;
  bestStreak: number;
  createdAt: string;
}

export interface SimpleDoData {
  tasks: Task[];
  inbox: InboxItem[];
  habits: Habit[];
}
