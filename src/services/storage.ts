import { AppData, DailyLog } from '../types';
import { INITIAL_DATA } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'simpledo_db';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Loads data from disk through backend API with localStorage fallback
 */
export async function loadAppData(): Promise<{ data: AppData; source: 'disk' | 'local' }> {
  try {
    const res = await fetch('/api/data', { method: 'GET' });
    if (res.ok) {
      const diskData = await res.json();
      if (diskData && Array.isArray(diskData.goals)) {
        // Also keep local storage synchronized
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diskData));
        return { data: diskData, source: 'disk' };
      }
    }
  } catch (err) {
    console.warn('API /api/data not reached, falling back to local storage', err);
  }

  // Fallback to localStorage
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return { data: parsed, source: 'local' };
    } catch (e) {
      console.error('Failed to parse local storage', e);
    }
  }

  // Fallback to initial seed data
  return { data: INITIAL_DATA, source: 'local' };
}

/**
 * Persists data to both disk backend API and localStorage
 */
export async function saveAppData(data: AppData): Promise<{ diskSaved: boolean }> {
  let diskSaved = false;
  // Always update localStorage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }

  // Send to backend disk storage
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      diskSaved = true;
    }
  } catch (err) {
    console.warn('Backend save to disk failed', err);
  }

  return { diskSaved };
}

/**
 * End-of-Day Sweep: removes completed goals from active list,
 * records today's daily log / streak statistics, and returns updated AppData.
 */
export function performEndOfDaySweep(data: AppData, reflection: string = ''): AppData {
  const today = getTodayDateString();
  const completedGoals = data.goals.filter((g) => g.completed);
  const remainingGoals = data.goals.filter((g) => !g.completed);

  // Check habits completed today
  const habitsDoneToday = data.habits.filter((h) => Boolean(h.history[today])).length;

  const newLog: DailyLog = {
    date: today,
    goalsCompleted: completedGoals.length,
    habitsCompleted: habitsDoneToday,
    archivedGoals: completedGoals.map((g) => ({
      id: g.id,
      title: g.title,
      inboxId: g.inboxId,
      priority: g.priority,
    })),
    clearedAt: new Date().toISOString(),
    reflection,
  };

  const updatedDailyLogs = [
    newLog,
    ...data.dailyLogs.filter((log) => log.date !== today),
  ];

  return {
    ...data,
    goals: remainingGoals,
    dailyLogs: updatedDailyLogs,
    settings: {
      ...data.settings,
      lastCleanedDate: today,
    },
  };
}

/**
 * Exports data as a downloadable JSON file
 */
export function exportBackup(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simpledo-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
