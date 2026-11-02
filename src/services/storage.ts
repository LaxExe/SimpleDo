import { SimpleDoData, Task, InboxItem, Habit } from '../types';

const STORAGE_KEY = 'simpledo_data_v1';
const EVENT_NAME = 'simpledo:change';

function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

const defaultData: SimpleDoData = {
  tasks: [
    {
      id: 'task-1',
      title: 'Review today’s key priorities',
      completed: false,
      priority: 'high',
      category: 'Focus',
      dueDate: getTodayStr(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Inbox zero check',
      completed: true,
      priority: 'medium',
      category: 'General',
      dueDate: getTodayStr(),
      createdAt: new Date().toISOString(),
    },
  ],
  inbox: [
    {
      id: 'inbox-1',
      content: 'Brainstorm goals for this weekend',
      processed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inbox-2',
      content: 'Look up design system motion curves',
      processed: false,
      createdAt: new Date().toISOString(),
    },
  ],
  habits: [
    {
      id: 'habit-1',
      name: 'Drink 2L Water',
      category: 'Health',
      frequency: 'daily',
      completedDates: [getTodayStr()],
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
      completedDates: [getTodayStr()],
      streak: 4,
      bestStreak: 10,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const storage = {
  load(): SimpleDoData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.save(defaultData);
        return defaultData;
      }
      return JSON.parse(raw);
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

  // Task methods
  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const data = this.load();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.tasks.unshift(newTask);
    this.save(data);
    return newTask;
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
    this.save(data);
  },

  // Inbox methods
  addInboxItem(content: string) {
    const data = this.load();
    const newItem: InboxItem = {
      id: `inbox-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      content: content.trim(),
      processed: false,
      createdAt: new Date().toISOString(),
    };
    data.inbox.unshift(newItem);
    this.save(data);
    return newItem;
  },

  deleteInboxItem(id: string) {
    const data = this.load();
    data.inbox = data.inbox.filter((item) => item.id !== id);
    this.save(data);
  },

  convertInboxToTask(id: string, priority: Task['priority'] = 'medium') {
    const data = this.load();
    const item = data.inbox.find((i) => i.id === id);
    if (!item) return;

    data.inbox = data.inbox.filter((i) => i.id !== id);
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: item.content,
      completed: false,
      priority,
      category: 'General',
      dueDate: getTodayStr(),
      createdAt: new Date().toISOString(),
    };
    data.tasks.unshift(newTask);
    this.save(data);
  },

  // Habit methods
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

      // Calculate streak
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
