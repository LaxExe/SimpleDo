import { SimpleDoData, Task, InboxGroup, Habit, DayPlan } from '../types';

const STORAGE_KEY = 'simpledo_data_v2';
const EVENT_NAME = 'simpledo:change';

export function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultInboxes: InboxGroup[] = [
  {
    id: 'inbox-general',
    name: 'General Inbox',
    description: 'Catch-all for daily tasks and thoughts',
    color: '#0068d6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inbox-work',
    name: 'Work & Projects',
    description: 'Professional milestones and deliverables',
    color: '#0070f3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inbox-personal',
    name: 'Personal & Health',
    description: 'Personal errands, fitness, and home tasks',
    color: '#10b981',
    createdAt: new Date().toISOString(),
  },
];

const today = getTodayStr();

const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review today’s key priorities and roadmap',
    completed: false,
    priority: 'high',
    category: 'Work',
    inboxId: 'inbox-work',
    dueDate: today,
    scheduledDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Check and clear General Inbox items',
    completed: true,
    priority: 'medium',
    category: 'General',
    inboxId: 'inbox-general',
    dueDate: today,
    scheduledDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Plan tomorrow’s deep focus session',
    completed: false,
    priority: 'medium',
    category: 'Work',
    inboxId: 'inbox-work',
    dueDate: today,
    scheduledDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Weekly grocery restock',
    completed: false,
    priority: 'low',
    category: 'Personal',
    inboxId: 'inbox-personal',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

const defaultHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Drink 2L Water',
    category: 'Health',
    frequency: 'daily',
    completedDates: [today],
    streak: 1,
    bestStreak: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    name: 'Morning Deep Work (45m)',
    category: 'Productivity',
    frequency: 'daily',
    completedDates: [],
    streak: 3,
    bestStreak: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    name: 'Read 20 pages',
    category: 'Learning',
    frequency: 'daily',
    completedDates: [today],
    streak: 4,
    bestStreak: 10,
    createdAt: new Date().toISOString(),
  },
];

const defaultDayPlans: Record<string, DayPlan> = {
  [today]: {
    date: today,
    plannedTaskIds: ['task-1', 'task-2', 'task-3'],
    plannedHabitIds: ['habit-1', 'habit-2', 'habit-3'],
  },
};

const defaultData: SimpleDoData = {
  tasks: defaultTasks,
  inboxes: defaultInboxes,
  habits: defaultHabits,
  dayPlans: defaultDayPlans,
};

export const storage = {
  load(): SimpleDoData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Check if v1 data exists to migrate
        const oldRaw = localStorage.getItem('simpledo_data_v1');
        if (oldRaw) {
          try {
            const oldData = JSON.parse(oldRaw);
            const migratedTasks: Task[] = Array.isArray(oldData.tasks) ? oldData.tasks : [];
            // Migrate old inbox strings to tasks under default inbox
            if (Array.isArray(oldData.inbox)) {
              oldData.inbox.forEach((item: { id: string; content: string; createdAt?: string }) => {
                migratedTasks.push({
                  id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  title: item.content,
                  completed: false,
                  priority: 'medium',
                  inboxId: 'inbox-general',
                  category: 'Inbox',
                  createdAt: item.createdAt || new Date().toISOString(),
                });
              });
            }
            const migrated: SimpleDoData = {
              tasks: migratedTasks.length ? migratedTasks : defaultTasks,
              inboxes: defaultInboxes,
              habits: Array.isArray(oldData.habits) ? oldData.habits : defaultHabits,
              dayPlans: defaultDayPlans,
            };
            this.save(migrated);
            return migrated;
          } catch {
            // fallback
          }
        }
        this.save(defaultData);
        return defaultData;
      }
      const parsed = JSON.parse(raw);
      // Ensure inboxes exist
      if (!parsed.inboxes || parsed.inboxes.length === 0) {
        parsed.inboxes = defaultInboxes;
      }
      if (!parsed.dayPlans) {
        parsed.dayPlans = defaultDayPlans;
      }
      return parsed;
    } catch {
      return defaultData;
    }
  },

  save(data: SimpleDoData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  },

  // ---------------- Tasks ----------------
  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const data = this.load();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.tasks.unshift(newTask);

    // If scheduled for a specific date, add to that date's dayPlan
    if (newTask.scheduledDate) {
      if (!data.dayPlans[newTask.scheduledDate]) {
        data.dayPlans[newTask.scheduledDate] = {
          date: newTask.scheduledDate,
          plannedTaskIds: [],
          plannedHabitIds: [],
        };
      }
      if (!data.dayPlans[newTask.scheduledDate].plannedTaskIds.includes(newTask.id)) {
        data.dayPlans[newTask.scheduledDate].plannedTaskIds.push(newTask.id);
      }
    }

    this.save(data);
    return newTask;
  },

  updateTask(id: string, updates: Partial<Task>) {
    const data = this.load();
    data.tasks = data.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.save(data);
  },

  toggleTask(id: string) {
    const data = this.load();
    data.tasks = data.tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    this.save(data);
  },

  deleteTask(id: string) {
    const data = this.load();
    data.tasks = data.tasks.filter((t) => t.id !== id);
    // Remove from all day plans
    Object.keys(data.dayPlans).forEach((date) => {
      data.dayPlans[date].plannedTaskIds = data.dayPlans[date].plannedTaskIds.filter(
        (tId) => tId !== id
      );
    });
    this.save(data);
  },

  // ---------------- Inboxes ----------------
  addInbox(name: string, description?: string, color?: string) {
    const data = this.load();
    const newInbox: InboxGroup = {
      id: `inbox-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      description: description?.trim(),
      color: color || '#0068d6',
      createdAt: new Date().toISOString(),
    };
    data.inboxes.push(newInbox);
    this.save(data);
    return newInbox;
  },

  deleteInbox(id: string) {
    const data = this.load();
    // Reassign tasks to general inbox
    data.tasks = data.tasks.map((t) =>
      t.inboxId === id ? { ...t, inboxId: 'inbox-general' } : t
    );
    data.inboxes = data.inboxes.filter((i) => i.id !== id);
    this.save(data);
  },

  // ---------------- Day Plans & Drag/Drop Scheduling ----------------
  getDayPlan(date: string): DayPlan {
    const data = this.load();
    if (!data.dayPlans[date]) {
      // Auto populate with daily habits if not set
      const dailyHabits = data.habits.map((h) => h.id);
      return {
        date,
        plannedTaskIds: [],
        plannedHabitIds: dailyHabits,
      };
    }
    return data.dayPlans[date];
  },

  addTaskToDate(date: string, taskId: string) {
    const data = this.load();
    if (!data.dayPlans[date]) {
      data.dayPlans[date] = {
        date,
        plannedTaskIds: [],
        plannedHabitIds: data.habits.map((h) => h.id),
      };
    }
    if (!data.dayPlans[date].plannedTaskIds.includes(taskId)) {
      data.dayPlans[date].plannedTaskIds.push(taskId);
    }
    // Update task's scheduledDate
    data.tasks = data.tasks.map((t) =>
      t.id === taskId ? { ...t, scheduledDate: date } : t
    );
    this.save(data);
  },

  removeTaskFromDate(date: string, taskId: string) {
    const data = this.load();
    if (data.dayPlans[date]) {
      data.dayPlans[date].plannedTaskIds = data.dayPlans[date].plannedTaskIds.filter(
        (id) => id !== taskId
      );
    }
    data.tasks = data.tasks.map((t) =>
      t.id === taskId && t.scheduledDate === date ? { ...t, scheduledDate: undefined } : t
    );
    this.save(data);
  },

  addHabitToDate(date: string, habitId: string) {
    const data = this.load();
    if (!data.dayPlans[date]) {
      data.dayPlans[date] = {
        date,
        plannedTaskIds: [],
        plannedHabitIds: [],
      };
    }
    if (!data.dayPlans[date].plannedHabitIds.includes(habitId)) {
      data.dayPlans[date].plannedHabitIds.push(habitId);
    }
    this.save(data);
  },

  removeHabitFromDate(date: string, habitId: string) {
    const data = this.load();
    if (data.dayPlans[date]) {
      data.dayPlans[date].plannedHabitIds = data.dayPlans[date].plannedHabitIds.filter(
        (id) => id !== habitId
      );
    }
    this.save(data);
  },

  moveTaskToDate(taskId: string, targetDate: string, fromDate?: string) {
    const data = this.load();
    if (fromDate && data.dayPlans[fromDate]) {
      data.dayPlans[fromDate].plannedTaskIds = data.dayPlans[fromDate].plannedTaskIds.filter(
        (id) => id !== taskId
      );
    }
    if (!data.dayPlans[targetDate]) {
      data.dayPlans[targetDate] = {
        date: targetDate,
        plannedTaskIds: [],
        plannedHabitIds: data.habits.map((h) => h.id),
      };
    }
    if (!data.dayPlans[targetDate].plannedTaskIds.includes(taskId)) {
      data.dayPlans[targetDate].plannedTaskIds.push(taskId);
    }
    data.tasks = data.tasks.map((t) =>
      t.id === taskId ? { ...t, scheduledDate: targetDate, dueDate: targetDate } : t
    );
    this.save(data);
  },

  // ---------------- Habits ----------------
  addHabit(habit: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'bestStreak' | 'createdAt'>) {
    const data = this.load();
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    data.habits.push(newHabit);

    // Also add to today's day plan
    const todayStr = getTodayStr();
    if (!data.dayPlans[todayStr]) {
      data.dayPlans[todayStr] = {
        date: todayStr,
        plannedTaskIds: [],
        plannedHabitIds: [],
      };
    }
    data.dayPlans[todayStr].plannedHabitIds.push(newHabit.id);

    this.save(data);
    return newHabit;
  },

  toggleHabitDate(id: string, dateStr: string) {
    const data = this.load();
    data.habits = data.habits.map((habit) => {
      if (habit.id !== id) return habit;
      const exists = habit.completedDates.includes(dateStr);
      const newDates = exists
        ? habit.completedDates.filter((d) => d !== dateStr)
        : [...habit.completedDates, dateStr];

      const streak = calculateStreak(newDates);
      const bestStreak = Math.max(habit.bestStreak, streak);

      return {
        ...habit,
        completedDates: newDates,
        streak,
        bestStreak,
      };
    });
    this.save(data);
  },

  deleteHabit(id: string) {
    const data = this.load();
    data.habits = data.habits.filter((h) => h.id !== id);
    // Remove from day plans
    Object.keys(data.dayPlans).forEach((date) => {
      data.dayPlans[date].plannedHabitIds = data.dayPlans[date].plannedHabitIds.filter(
        (hId) => hId !== id
      );
    });
    this.save(data);
  },
};

function calculateStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!sorted.includes(today) && !sorted.includes(yesterday)) {
    return 0;
  }

  let currentStreak = 0;
  let checkDate = sorted.includes(today) ? new Date() : new Date(Date.now() - 86400000);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return currentStreak;
}
