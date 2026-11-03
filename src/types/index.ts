export type Page = 'today' | 'tasks' | 'inbox' | 'tracker';

export type Priority = 'low' | 'medium' | 'high';

export interface InboxGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  inboxId?: string; // Links task to a specific inbox
  dueDate?: string; // YYYY-MM-DD
  scheduledDate?: string; // YYYY-MM-DD (Date on which this task is planned in the Today/Day planner)
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

export interface InboxEvent {
  id: string;
  title: string;
  inboxId?: string; // Links event to an inbox
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "14:30" or "2:30 PM"
  location?: string; // e.g. "Room 101" or "Zoom"
  description?: string;
  completed?: boolean;
  createdAt: string;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  notes?: string;
  plannedTaskIds: string[];
  plannedHabitIds: string[];
}

export interface SimpleDoData {
  tasks: Task[];
  events: InboxEvent[];
  inboxes: InboxGroup[];
  habits: Habit[];
  dayPlans: Record<string, DayPlan>; // Keyed by YYYY-MM-DD
}
