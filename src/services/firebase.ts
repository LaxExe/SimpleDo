import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, off } from 'firebase/database';
import { SimpleDoData, DayPlan, UserProfile } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyDMptOnosS2HA35NDLrH9lWZpFyQDHTlfw",
  authDomain: "simple-do-c5438.firebaseapp.com",
  projectId: "simple-do-c5438",
  storageBucket: "simple-do-c5438.firebasestorage.app",
  messagingSenderId: "925028161135",
  appId: "1:925028161135:web:5e7e58e2d76730637c9f9a",
  measurementId: "G-8K70B8K20Z",
  databaseURL: "https://simple-do-c5438-default-rtdb.firebaseio.com"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);

export type SyncStatus = 'connecting' | 'connected' | 'permission_denied' | 'error' | 'disabled';

let syncStatus: SyncStatus = 'connecting';
let statusListeners: ((status: SyncStatus) => void)[] = [];
let isApplyingRemoteChange = false;

// Dynamic database path per authenticated user
const ACTIVE_USER_STORAGE_KEY = 'simpledo_active_user_v1';

function getInitialDbPath(): string {
  if (typeof window === 'undefined') return 'simpledo_data';
  try {
    const raw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      if (parsed && parsed.dbPath) {
        return parsed.dbPath;
      }
    }
  } catch {
    // fallback
  }
  return 'simpledo_data';
}

let activeDbPath: string = getInitialDbPath();
let currentUnsubscribe: (() => void) | null = null;
let savedOnRemoteData: ((data: SimpleDoData) => void) | null = null;
let savedGetLocalData: (() => SimpleDoData) | null = null;

export function getActiveDatabasePath(): string {
  return activeDbPath;
}

export function getActiveDatabaseRestUrl(): string {
  return `${firebaseConfig.databaseURL}/${activeDbPath}.json`;
}

export function getFirebaseSyncStatus(): SyncStatus {
  return syncStatus;
}

export function subscribeToFirebaseStatus(callback: (status: SyncStatus) => void): () => void {
  statusListeners.push(callback);
  callback(syncStatus);
  return () => {
    statusListeners = statusListeners.filter((cb) => cb !== callback);
  };
}

function setSyncStatus(newStatus: SyncStatus) {
  if (syncStatus !== newStatus) {
    syncStatus = newStatus;
    statusListeners.forEach((cb) => cb(syncStatus));
  }
}

/**
 * Normalizes Firebase RTDB data. Firebase omits empty arrays/objects and
 * converts arrays to objects if numeric keys are sparse.
 * This guarantees plannedTaskIds, plannedHabitIds, and completedDates are always arrays.
 */
export function normalizeFirebaseData(val: any): SimpleDoData {
  if (!val || typeof val !== 'object') {
    return {
      tasks: [],
      events: [],
      inboxes: [
        {
          id: 'inbox-general',
          name: 'General',
          description: 'Quick catch-all',
          color: '#171717',
          createdAt: new Date().toISOString(),
        },
      ],
      habits: [],
      dayPlans: {},
    };
  }

  const toArray = (v: any) => {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(Boolean);
    if (typeof v === 'object') return Object.values(v).filter(Boolean);
    return [];
  };

  // 1. DayPlans normalization
  const normalizedDayPlans: Record<string, DayPlan> = {};
  if (val.dayPlans && typeof val.dayPlans === 'object') {
    Object.entries(val.dayPlans).forEach(([dateKey, plan]: [string, any]) => {
      if (plan && typeof plan === 'object') {
        normalizedDayPlans[dateKey] = {
          date: plan.date || dateKey,
          plannedTaskIds: toArray(plan.plannedTaskIds),
          plannedHabitIds: toArray(plan.plannedHabitIds),
        };
      }
    });
  }

  // 2. Habits normalization
  const normalizedHabits = toArray(val.habits).map((h: any) => ({
    ...h,
    completedDates: toArray(h.completedDates),
    streak: typeof h.streak === 'number' ? h.streak : 0,
    bestStreak: typeof h.bestStreak === 'number' ? h.bestStreak : 0,
  }));

  // 3. Tasks normalization
  const normalizedTasks = toArray(val.tasks).map((t: any) => ({
    ...t,
    hasProgress: Boolean(t.hasProgress),
    totalParts: t.totalParts || 4,
    completedParts: t.completed ? (t.totalParts || 4) : (t.completedParts ?? 0),
  }));

  // 4. Inboxes normalization
  const normalizedInboxes = toArray(val.inboxes);

  return {
    tasks: normalizedTasks,
    events: toArray(val.events),
    inboxes: normalizedInboxes.length > 0 ? normalizedInboxes : [
      {
        id: 'inbox-general',
        name: 'General',
        description: 'Quick catch-all',
        color: '#171717',
        createdAt: new Date().toISOString(),
      }
    ],
    habits: normalizedHabits,
    dayPlans: normalizedDayPlans,
  };
}

/**
 * Syncs local data to the active user's Firebase Realtime Database path
 */
export async function pushToFirebase(data: SimpleDoData, customPath?: string): Promise<boolean> {
  if (isApplyingRemoteChange && !customPath) return true;

  const targetPath = customPath || activeDbPath;
  if (!targetPath) return false;

  try {
    const dataRef = ref(rtdb, targetPath);
    const cleanData = JSON.parse(JSON.stringify(data));
    await set(dataRef, cleanData);
    setSyncStatus('connected');
    return true;
  } catch (err: any) {
    if (err?.code === 'PERMISSION_DENIED' || err?.message?.includes('Permission denied')) {
      console.warn('Firebase RTDB Permission Denied: Rules must be set to read: true, write: true');
      setSyncStatus('permission_denied');
    } else {
      console.warn('Firebase push failed:', err);
      setSyncStatus('error');
    }
    return false;
  }
}

/**
 * Switches the active Firebase Realtime Database path (e.g. when a user logs in or switches accounts)
 */
export function setActiveDatabasePath(newPath: string) {
  if (activeDbPath === newPath && currentUnsubscribe) {
    return;
  }
  activeDbPath = newPath;
  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }
  if (savedOnRemoteData && savedGetLocalData) {
    initFirebaseSync(savedOnRemoteData, savedGetLocalData);
  }
}

/**
 * Initializes two-way real-time listener between Firebase RTDB and local storage
 */
export function initFirebaseSync(
  onRemoteData: (data: SimpleDoData) => void,
  getLocalData: () => SimpleDoData
) {
  savedOnRemoteData = onRemoteData;
  savedGetLocalData = getLocalData;

  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }

  const targetPath = activeDbPath || 'simpledo_data';
  const dataRef = ref(rtdb, targetPath);

  onValue(
    dataRef,
    (snapshot) => {
      const val = snapshot.val();
      setSyncStatus('connected');

      if (val && typeof val === 'object') {
        const normalized = normalizeFirebaseData(val);
        isApplyingRemoteChange = true;
        try {
          onRemoteData(normalized);
        } finally {
          isApplyingRemoteChange = false;
        }
      } else if (!val) {
        // Database node is empty in Firebase: seed it from local device if local device has data
        const localData = getLocalData();
        if (localData && (localData.tasks.length > 0 || (localData.events && localData.events.length > 0) || localData.habits.length > 0)) {
          pushToFirebase(localData, targetPath);
        }
      }
    },
    (err) => {
      if (err?.message?.includes('Permission denied') || (err as any)?.code === 'PERMISSION_DENIED') {
        console.warn('Firebase RTDB Permission Denied');
        setSyncStatus('permission_denied');
      } else {
        setSyncStatus('error');
      }
    }
  );

  currentUnsubscribe = () => {
    off(dataRef);
  };

  return currentUnsubscribe;
}

/**
 * Fetches data once from a specific database path in Firebase RTDB
 */
export async function fetchDatabaseNode(path: string): Promise<any> {
  const nodeRef = ref(rtdb, path);
  const snapshot = await get(nodeRef);
  return snapshot.exists() ? snapshot.val() : null;
}

/**
 * Writes data once to a specific database path in Firebase RTDB
 */
export async function writeDatabaseNode(path: string, payload: any): Promise<void> {
  const nodeRef = ref(rtdb, path);
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await set(nodeRef, cleanPayload);
}
