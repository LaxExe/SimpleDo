export type Priority = 'low' | 'medium' | 'high';

export interface Goal {
  id: string;
  title: string;
  notes?: string;
  inboxId: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  priority: Priority;
  dueDate?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  streak: number;
  bestStreak: number;
  history: Record<string, boolean>; // 'YYYY-MM-DD' => boolean
  inboxId: string;
  createdAt: string;
}

export interface Inbox {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface DailyLog {
  date: string; // 'YYYY-MM-DD'
  goalsCompleted: number;
  habitsCompleted: number;
  archivedGoals: {
    id: string;
    title: string;
    inboxId: string;
    priority: Priority;
  }[];
  clearedAt: string;
  reflection?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  sidebarOrder?: string[];
  lastCleanedDate?: string;
  dailyGoalTarget?: number;
}

export interface AppData {
  goals: Goal[];
  habits: Habit[];
  inboxes: Inbox[];
  dailyLogs: DailyLog[];
  settings: UserSettings;
}
