import { SimpleDoData, Task, InboxGroup, Habit, DayPlan, InboxEvent } from '../types';

const STORAGE_KEY = 'simpledo_data_v4';
const EVENT_NAME = 'simpledo:change';

export function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const PRESET_INBOX_COLORS = [
  '#0068d6', // Vercel Primary Blue
  '#0070f3', // Accent Electric Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red / Crimson
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#171717', // Neutral Black
  '#64748b', // Slate
];

/**
 * Sorts tasks so that active (uncompleted) tasks appear first,
 * prioritized by High -> Medium -> Low, and completed tasks appear at the bottom.
 */
export function sortTasks(tasks: Task[]): Task[] {
  const priorityWeight: Record<Task['priority'], number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    // 1. Active before completed
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 2. High priority before low
    const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (weightDiff !== 0) {
      return weightDiff;
    }
    // 3. Newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

const defaultInboxes: InboxGroup[] = [
  {
    id: 'inbox-general',
    name: 'General',
    description: 'Quick catch-all',
    color: '#171717',
    createdAt: new Date().toISOString(),
  },
];

const defaultTasks: Task[] = [];
const defaultEvents: InboxEvent[] = [];
const defaultHabits: Habit[] = [];
const defaultDayPlans: Record<string, DayPlan> = {};

const defaultData: SimpleDoData = {
  tasks: defaultTasks,
  events: defaultEvents,
  inboxes: defaultInboxes,
  habits: defaultHabits,
  dayPlans: defaultDayPlans,
};

/**
 * Calculates a habit's streak according to user rules:
 * - Only days where the habit was DRAGGED IN / SCHEDULED count toward the streak.
 * - If a habit was not dragged in on a day, that day is ignored and does NOT break the streak.
 * - If a habit was dragged in and completed, streak increments.
 * - If a habit was dragged in on a past day and NOT completed, streak breaks.
 */
export function calculateCustomHabitStreak(
  habit: Habit,
  dayPlans: Record<string, DayPlan>
): { streak: number; bestStreak: number } {
  const todayStr = getTodayStr();

  // Find all dates where the habit was planned and is on or before today
  const plannedDates = Object.keys(dayPlans)
    .filter((dateStr) => {
      const plan = dayPlans[dateStr];
      return plan && plan.plannedHabitIds && plan.plannedHabitIds.includes(habit.id);
    })
    .filter((dateStr) => dateStr <= todayStr)
    .sort() // ascending chronological: ['2026-11-01', '2026-11-02']
    .reverse(); // descending: newest first

  if (plannedDates.length === 0) {
    return { streak: 0, bestStreak: habit.bestStreak || 0 };
  }

  let streak = 0;
  let isStreakActive = true;

  for (let i = 0; i < plannedDates.length; i++) {
    const date = plannedDates[i];
    const isCompleted = habit.completedDates.includes(date);

    if (date === todayStr) {
      if (isCompleted) {
        streak++;
      }
      // If not completed today, today is still ongoing, so continue checking previous planned days
      continue;
    }

    // Past planned day:
    if (isCompleted && isStreakActive) {
      streak++;
    } else {
      // Past day was planned but NOT completed -> streak ends here
      isStreakActive = false;
      break;
    }
  }

  const bestStreak = Math.max(habit.bestStreak || 0, streak);
  return { streak, bestStreak };
}

export const storage = {
  load(): SimpleDoData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.save(defaultData);
        return defaultData;
      }
      const parsed = JSON.parse(raw);
      if (!parsed.inboxes || parsed.inboxes.length === 0) {
        parsed.inboxes = defaultInboxes;
      }
      if (!parsed.dayPlans) {
        parsed.dayPlans = defaultDayPlans;
      }
      if (!parsed.events) {
        parsed.events = [];
      }
      if (parsed.tasks) {
        parsed.tasks = parsed.tasks.map((t: Task) => ({
          ...t,
          hasProgress: Boolean(t.hasProgress),
          totalParts: t.totalParts || 4,
          completedParts: t.completed ? (t.totalParts || 4) : (t.completedParts ?? 0),
        }));
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
      hasProgress: false,
      totalParts: 4,
      completedParts: 0,
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.tasks.unshift(newTask);

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
    const oldTask = data.tasks.find((t) => t.id === id);

    data.tasks = data.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));

    // Handle scheduledDate changes if scheduledDate was updated
    if (updates.scheduledDate !== undefined && oldTask?.scheduledDate !== updates.scheduledDate) {
      // Remove from old scheduled date dayPlan
      if (oldTask?.scheduledDate && data.dayPlans[oldTask.scheduledDate]) {
        data.dayPlans[oldTask.scheduledDate].plannedTaskIds = data.dayPlans[
          oldTask.scheduledDate
        ].plannedTaskIds.filter((tId) => tId !== id);
      }
      // Add to new scheduled date dayPlan
      if (updates.scheduledDate) {
        if (!data.dayPlans[updates.scheduledDate]) {
          data.dayPlans[updates.scheduledDate] = {
            date: updates.scheduledDate,
            plannedTaskIds: [],
            plannedHabitIds: [],
          };
        }
        if (!data.dayPlans[updates.scheduledDate].plannedTaskIds.includes(id)) {
          data.dayPlans[updates.scheduledDate].plannedTaskIds.push(id);
        }
      }
    }

    this.save(data);
  },

  toggleTask(id: string) {
    const data = this.load();
    data.tasks = data.tasks.map((t) => {
      if (t.id === id) {
        const willComplete = !t.completed;
        const total = t.totalParts || 4;
        return {
          ...t,
          completed: willComplete,
          completedParts: willComplete ? total : 0,
        };
      }
      return t;
    });
    this.save(data);
  },

  setTaskProgress(id: string, parts: number) {
    const data = this.load();
    data.tasks = data.tasks.map((t) => {
      if (t.id === id) {
        const total = t.totalParts || 4;
        const clamped = Math.max(0, Math.min(total, parts));
        // Progress does NOT auto-complete tasks. Completion is strictly confirmed by clicking the circle.
        return {
          ...t,
          hasProgress: true, // Activated on click / set!
          completedParts: clamped,
        };
      }
      return t;
    });
    this.save(data);
  },

  deleteTask(id: string) {
    const data = this.load();
    data.tasks = data.tasks.filter((t) => t.id !== id);
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
      color: color || '#171717',
      createdAt: new Date().toISOString(),
    };
    data.inboxes.push(newInbox);
    this.save(data);
    return newInbox;
  },

  updateInbox(id: string, updates: Partial<InboxGroup>) {
    const data = this.load();
    data.inboxes = data.inboxes.map((i) => (i.id === id ? { ...i, ...updates } : i));
    this.save(data);
  },

  deleteInbox(id: string) {
    const data = this.load();
    data.tasks = data.tasks.map((t) =>
      t.inboxId === id ? { ...t, inboxId: 'inbox-general' } : t
    );
    data.events = (data.events || []).map((e) =>
      e.inboxId === id ? { ...e, inboxId: 'inbox-general' } : e
    );
    data.inboxes = data.inboxes.filter((i) => i.id !== id);
    this.save(data);
  },

  reorderInboxes(newInboxes: InboxGroup[]) {
    const data = this.load();
    data.inboxes = newInboxes;
    this.save(data);
  },

  moveInbox(fromIndex: number, toIndex: number) {
    const data = this.load();
    if (
      fromIndex < 0 ||
      fromIndex >= data.inboxes.length ||
      toIndex < 0 ||
      toIndex >= data.inboxes.length
    ) {
      return;
    }
    const [moved] = data.inboxes.splice(fromIndex, 1);
    data.inboxes.splice(toIndex, 0, moved);
    this.save(data);
  },

  // ---------------- Events (Inbox Calendar Entries) ----------------
  addEvent(event: Omit<InboxEvent, 'id' | 'createdAt'>) {
    const data = this.load();
    const newEvent: InboxEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    if (!data.events) {
      data.events = [];
    }
    data.events.unshift(newEvent);
    this.save(data);
    return newEvent;
  },

  updateEvent(id: string, updates: Partial<InboxEvent>) {
    const data = this.load();
    if (!data.events) data.events = [];
    data.events = data.events.map((e) => (e.id === id ? { ...e, ...updates } : e));
    this.save(data);
  },

  deleteEvent(id: string) {
    const data = this.load();
    if (!data.events) data.events = [];
    data.events = data.events.filter((e) => e.id !== id);
    this.save(data);
  },

  toggleEvent(id: string) {
    const data = this.load();
    if (!data.events) data.events = [];
    data.events = data.events.map((e) =>
      e.id === id ? { ...e, completed: !e.completed } : e
    );
    this.save(data);
  },

  // ---------------- Day Plans & Drag/Drop Scheduling ----------------
  getDayPlan(date: string): DayPlan {
    const data = this.load();
    if (!data.dayPlans[date]) {
      return {
        date,
        plannedTaskIds: [],
        plannedHabitIds: [],
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
        plannedHabitIds: [],
      };
    }
    if (!data.dayPlans[date].plannedTaskIds.includes(taskId)) {
      data.dayPlans[date].plannedTaskIds.push(taskId);
    }
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
    data.tasks = data.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          scheduledDate: t.scheduledDate === date ? undefined : t.scheduledDate,
          dueDate: t.dueDate === date ? undefined : t.dueDate,
        };
      }
      return t;
    });
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

    // Recompute streak for this habit
    data.habits = data.habits.map((h) => {
      if (h.id === habitId) {
        const { streak, bestStreak } = calculateCustomHabitStreak(h, data.dayPlans);
        return { ...h, streak, bestStreak };
      }
      return h;
    });

    this.save(data);
  },

  removeHabitFromDate(date: string, habitId: string) {
    const data = this.load();
    if (data.dayPlans[date]) {
      data.dayPlans[date].plannedHabitIds = data.dayPlans[date].plannedHabitIds.filter(
        (id) => id !== habitId
      );
    }

    // Recompute streak for this habit
    data.habits = data.habits.map((h) => {
      if (h.id === habitId) {
        const { streak, bestStreak } = calculateCustomHabitStreak(h, data.dayPlans);
        return { ...h, streak, bestStreak };
      }
      return h;
    });

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
        plannedHabitIds: [],
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

    // Auto-add to today's plan
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

      const updatedHabit = { ...habit, completedDates: newDates };
      const { streak, bestStreak } = calculateCustomHabitStreak(updatedHabit, data.dayPlans);

      return {
        ...updatedHabit,
        streak,
        bestStreak,
      };
    });
    this.save(data);
  },

  deleteHabit(id: string) {
    const data = this.load();
    data.habits = data.habits.filter((h) => h.id !== id);
    Object.keys(data.dayPlans).forEach((date) => {
      data.dayPlans[date].plannedHabitIds = data.dayPlans[date].plannedHabitIds.filter(
        (hId) => hId !== id
      );
    });
    this.save(data);
  },

  resetAll() {
    this.save({
      tasks: [],
      events: [],
      inboxes: defaultInboxes,
      habits: [],
      dayPlans: {},
    });
  },
};
