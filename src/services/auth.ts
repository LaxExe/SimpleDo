import { UserProfile, SimpleDoData, StarterTemplate } from '../types';
import {
  fetchDatabaseNode,
  writeDatabaseNode,
  normalizeFirebaseData,
  setActiveDatabasePath,
} from './firebase';
import { storage, getTodayStr } from './storage';

const ACTIVE_USER_KEY = 'simpledo_active_user_v1';
const AUTH_COOKIE_NAME = 'simpledo_active_user_v1';
const AUTH_EVENT_NAME = 'simpledo:auth_change';

function setPersistentAuthStorage(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify(profile);
  try {
    localStorage.setItem(ACTIVE_USER_KEY, serialized);
  } catch {
    // ignore storage quota errors
  }
  try {
    const encoded = encodeURIComponent(serialized);
    // 10-year max-age cookie so session persists across restarts/PWA contexts until explicit sign-out
    document.cookie = `${AUTH_COOKIE_NAME}=${encoded}; path=/; max-age=315360000; SameSite=Lax`;
  } catch {
    // ignore cookie errors
  }
  try {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  } catch {
    // ignore
  }
}

function clearPersistentAuthStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } catch {
    // ignore
  }
  try {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch {
    // ignore
  }
}

function readAuthCookie(): UserProfile | null {
  if (typeof document === 'undefined' || !document.cookie) return null;
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (!match) return null;
    const rawValue = decodeURIComponent(match.substring(AUTH_COOKIE_NAME.length + 1));
    const parsed: UserProfile = JSON.parse(rawValue);
    if (parsed && parsed.id && parsed.dbPath) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Normalizes a username or email prefix into a safe Firebase Realtime Database key
 * (Firebase keys cannot contain ., $, #, [, ], /)
 */
export function normalizeUserKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Hashes a password using Web Crypto SHA-256 (with deterministic fallback)
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const input = `simpledo_v2:${salt}:${password}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Fallback simple deterministic hash
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Generates initial workspace data for a newly registered user based on their chosen template
 */
export async function buildStarterWorkspace(
  template: StarterTemplate,
  displayName: string
): Promise<SimpleDoData> {
  const todayStr = getTodayStr();
  const nowIso = new Date().toISOString();

  if (template === 'import_legacy') {
    try {
      const legacyVal = await fetchDatabaseNode('simpledo_data');
      if (legacyVal) {
        return normalizeFirebaseData(legacyVal);
      }
    } catch (e) {
      console.warn('Could not fetch legacy workspace, falling back to starter:', e);
    }
  }

  if (template === 'blank') {
    return {
      tasks: [],
      events: [],
      inboxes: [
        {
          id: 'inbox-general',
          name: 'General',
          description: 'Quick catch-all',
          color: '#171717',
          createdAt: nowIso,
        },
      ],
      habits: [],
      dayPlans: {
        [todayStr]: {
          date: todayStr,
          plannedTaskIds: [],
          plannedHabitIds: [],
        },
      },
    };
  }

  if (template === 'student') {
    const t1 = `task-${Date.now()}-1`;
    const t2 = `task-${Date.now()}-2`;
    const t3 = `task-${Date.now()}-3`;
    const h1 = `habit-${Date.now()}-1`;
    const h2 = `habit-${Date.now()}-2`;

    return {
      inboxes: [
        {
          id: 'inbox-general',
          name: 'General',
          description: 'Quick catch-all',
          color: '#171717',
          createdAt: nowIso,
        },
        {
          id: 'inbox-math',
          name: 'Mathematics',
          description: 'Problem sets & lectures',
          color: '#f59e0b',
          createdAt: nowIso,
        },
        {
          id: 'inbox-cs',
          name: 'Computer Science',
          description: 'Labs, algorithms & systems',
          color: '#ef4444',
          createdAt: nowIso,
        },
        {
          id: 'inbox-physics',
          name: 'Physics & Engineering',
          description: 'Tutorials & lab reports',
          color: '#8b5cf6',
          createdAt: nowIso,
        },
      ],
      tasks: [
        {
          id: t1,
          title: 'Complete Week 4 Problem Set & upload PDF',
          completed: false,
          priority: 'high',
          inboxId: 'inbox-math',
          category: 'Mathematics',
          scheduledDate: todayStr,
          dueDate: todayStr,
          hasProgress: true,
          totalParts: 4,
          completedParts: 2,
          createdAt: nowIso,
        },
        {
          id: t2,
          title: 'Implement binary search tree traversal lab',
          completed: false,
          priority: 'high',
          inboxId: 'inbox-cs',
          category: 'Computer Science',
          scheduledDate: todayStr,
          hasProgress: true,
          totalParts: 4,
          completedParts: 1,
          createdAt: nowIso,
        },
        {
          id: t3,
          title: 'Review lecture notes & summarize key formulas',
          completed: false,
          priority: 'medium',
          inboxId: 'inbox-physics',
          category: 'Physics & Engineering',
          hasProgress: false,
          totalParts: 4,
          completedParts: 0,
          createdAt: nowIso,
        },
      ],
      events: [
        {
          id: `event-${Date.now()}-1`,
          title: 'Midterm Review Session',
          inboxId: 'inbox-math',
          date: todayStr,
          time: '15:00',
          location: 'Room 204',
          createdAt: nowIso,
        },
      ],
      habits: [
        {
          id: h1,
          name: '90m Deep Focus Study Block',
          category: 'Academics',
          frequency: 'daily',
          completedDates: [],
          streak: 0,
          bestStreak: 0,
          createdAt: nowIso,
        },
        {
          id: h2,
          name: 'Review Anki Flashcards',
          category: 'Memory',
          frequency: 'daily',
          completedDates: [],
          streak: 0,
          bestStreak: 0,
          createdAt: nowIso,
        },
      ],
      dayPlans: {
        [todayStr]: {
          date: todayStr,
          plannedTaskIds: [t1, t2],
          plannedHabitIds: [h1, h2],
        },
      },
    };
  }

  // Default: 'starter' (Guided Starter Workspace)
  const task1Id = `task-${Date.now()}-s1`;
  const task2Id = `task-${Date.now()}-s2`;
  const task3Id = `task-${Date.now()}-s3`;
  const habit1Id = `habit-${Date.now()}-h1`;
  const habit2Id = `habit-${Date.now()}-h2`;

  return {
    inboxes: [
      {
        id: 'inbox-general',
        name: 'General',
        description: 'Quick catch-all',
        color: '#171717',
        createdAt: nowIso,
      },
      {
        id: 'inbox-product',
        name: 'Product & Engineering',
        description: 'Core builds, specs & sprints',
        color: '#0070f3',
        createdAt: nowIso,
      },
      {
        id: 'inbox-growth',
        name: 'Strategy & Research',
        description: 'Reading, notes & deep work',
        color: '#10b981',
        createdAt: nowIso,
      },
      {
        id: 'inbox-personal',
        name: 'Personal',
        description: 'Life, errands & routines',
        color: '#8b5cf6',
        createdAt: nowIso,
      },
    ],
    tasks: [
      {
        id: task1Id,
        title: `Welcome ${displayName.split(' ')[0] || 'to SimpleDo'} — Click this title to cycle the 4-part progress bar`,
        completed: false,
        priority: 'high',
        inboxId: 'inbox-product',
        category: 'Product & Engineering',
        scheduledDate: todayStr,
        dueDate: todayStr,
        hasProgress: true,
        totalParts: 4,
        completedParts: 2,
        createdAt: nowIso,
      },
      {
        id: task2Id,
        title: 'Explore the Inbox Hub & organize tasks by 10-color semantic groups',
        completed: false,
        priority: 'medium',
        inboxId: 'inbox-growth',
        category: 'Strategy & Research',
        scheduledDate: todayStr,
        hasProgress: true,
        totalParts: 4,
        completedParts: 1,
        createdAt: nowIso,
      },
      {
        id: task3Id,
        title: 'Check the .Agents console to see your personal Firebase REST endpoint',
        completed: false,
        priority: 'low',
        inboxId: 'inbox-general',
        category: 'General',
        hasProgress: false,
        totalParts: 4,
        completedParts: 0,
        createdAt: nowIso,
      },
    ],
    events: [
      {
        id: `event-${Date.now()}-e1`,
        title: 'Weekly Planning & Architecture Sync',
        inboxId: 'inbox-product',
        date: todayStr,
        time: '14:00',
        location: 'Workspace',
        createdAt: nowIso,
      },
    ],
    habits: [
      {
        id: habit1Id,
        name: '60m Uninterrupted Deep Work',
        category: 'Focus',
        frequency: 'daily',
        completedDates: [],
        streak: 0,
        bestStreak: 0,
        createdAt: nowIso,
      },
      {
        id: habit2Id,
        name: '30m Exercise or Mobility',
        category: 'Health',
        frequency: 'daily',
        completedDates: [],
        streak: 0,
        bestStreak: 0,
        createdAt: nowIso,
      },
    ],
    dayPlans: {
      [todayStr]: {
        date: todayStr,
        plannedTaskIds: [task1Id, task2Id],
        plannedHabitIds: [habit1Id, habit2Id],
      },
    },
  };
}

export const auth = {
  /**
   * Returns the currently authenticated user profile from localStorage (with persistent cookie backup), or null if signed out
   */
  getCurrentUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(ACTIVE_USER_KEY);
      if (raw) {
        const parsed: UserProfile = JSON.parse(raw);
        if (parsed && parsed.id && parsed.dbPath) {
          return parsed;
        }
      }
    } catch {
      // fallback to cookie below
    }

    const cookieUser = readAuthCookie();
    if (cookieUser) {
      try {
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(cookieUser));
      } catch {
        // ignore
      }
      return cookieUser;
    }
    return null;
  },

  /**
   * Internal helper to activate a user session locally and point Firebase RTDB to their path
   */
  activateSession(profile: UserProfile, initialData?: SimpleDoData, skipFirebasePush = true) {
    setPersistentAuthStorage(profile);
    if (initialData) {
      storage.save(initialData, skipFirebasePush);
    }
    setActiveDatabasePath(profile.dbPath);
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
    window.dispatchEvent(new Event('simpledo:change'));
  },

  /**
   * Registers a brand new user account in Firebase Realtime Database (`/users/<userKey>`)
   */
  async signUp(params: {
    displayName: string;
    username: string;
    email: string;
    password: string;
    template: StarterTemplate;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanName = params.displayName.trim();
    const cleanEmail = params.email.trim().toLowerCase();
    const rawUsername = params.username.trim() || cleanEmail.split('@')[0];
    const userKey = normalizeUserKey(rawUsername);

    if (!cleanName) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!userKey || userKey.length < 2) {
      return { success: false, error: 'Username must be at least 2 alphanumeric characters.' };
    }
    if (!params.password || params.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    try {
      // 1. Check if username already exists in Firebase RTDB
      const existingProfile = await fetchDatabaseNode(`users/${userKey}/profile`);
      if (existingProfile) {
        return {
          success: false,
          error: `Username "@${userKey}" is already registered. Please sign in or choose another username.`,
        };
      }

      // 2. Hash password & build user profile
      const nowIso = new Date().toISOString();
      const passwordHash = await hashPassword(params.password, userKey);
      const dbPath = `users/${userKey}/data`;

      const profileInDb = {
        id: userKey,
        username: userKey,
        email: cleanEmail || `${userKey}@simpledo.app`,
        displayName: cleanName,
        passwordHash,
        dbPath,
        template: params.template,
        createdAt: nowIso,
        lastLoginAt: nowIso,
      };

      // 3. Build starter workspace data and write both profile and data to Firebase RTDB
      const starterData = await buildStarterWorkspace(params.template, cleanName);

      await writeDatabaseNode(`users/${userKey}/profile`, profileInDb);
      await writeDatabaseNode(dbPath, starterData);

      const sessionProfile: UserProfile = {
        id: userKey,
        username: userKey,
        email: profileInDb.email,
        displayName: cleanName,
        dbPath,
        createdAt: nowIso,
        lastLoginAt: nowIso,
      };

      this.activateSession(sessionProfile, starterData, true);
      return { success: true, user: sessionProfile };
    } catch (err: any) {
      console.error('Sign up error:', err);
      return {
        success: false,
        error: err?.message || 'Could not connect to database to complete sign up.',
      };
    }
  },

  /**
   * Authenticates an existing user against Firebase Realtime Database (`/users/<userKey>`)
   */
  async signIn(params: {
    identifier: string; // username or email
    password: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const rawId = params.identifier.trim().toLowerCase();
    if (!rawId) {
      return { success: false, error: 'Please enter your username or email.' };
    }
    if (!params.password) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      let targetKey = normalizeUserKey(rawId);
      let profileInDb = await fetchDatabaseNode(`users/${targetKey}/profile`);

      // If user typed an email address (e.g. alex@domain.com), search `/users` by email if direct key didn't match
      if (!profileInDb && rawId.includes('@')) {
        const allUsers = await fetchDatabaseNode('users');
        if (allUsers && typeof allUsers === 'object') {
          for (const [k, val] of Object.entries<any>(allUsers)) {
            if (val?.profile?.email?.toLowerCase() === rawId || val?.profile?.username?.toLowerCase() === rawId) {
              targetKey = k;
              profileInDb = val.profile;
              break;
            }
          }
        }
      }

      if (!profileInDb) {
        return {
          success: false,
          error: `No account found for "${params.identifier}". Create an account first!`,
        };
      }

      const expectedHash = await hashPassword(params.password, targetKey);
      if (profileInDb.passwordHash && profileInDb.passwordHash !== expectedHash) {
        return {
          success: false,
          error: 'Incorrect password. Please try again.',
        };
      }

      // Update lastLoginAt in DB
      const nowIso = new Date().toISOString();
      const dbPath = profileInDb.dbPath || `users/${targetKey}/data`;
      await writeDatabaseNode(`users/${targetKey}/profile/lastLoginAt`, nowIso);

      // Fetch user's stored workspace data from Firebase RTDB
      const rawUserData = await fetchDatabaseNode(dbPath);
      const normalizedData = normalizeFirebaseData(rawUserData);

      const sessionProfile: UserProfile = {
        id: targetKey,
        username: profileInDb.username || targetKey,
        email: profileInDb.email || '',
        displayName: profileInDb.displayName || targetKey,
        dbPath,
        createdAt: profileInDb.createdAt || nowIso,
        lastLoginAt: nowIso,
      };

      this.activateSession(sessionProfile, normalizedData, true);
      return { success: true, user: sessionProfile };
    } catch (err: any) {
      console.error('Sign in error:', err);
      return {
        success: false,
        error: err?.message || 'Failed to sign in with database.',
      };
    }
  },

  /**
   * Connects directly to the primary root `/simpledo_data` database node
   * (Preserves 100% compatibility with the owner's existing database and external scripts)
   */
  async connectLegacyWorkspace(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const nowIso = new Date().toISOString();
      const rawLegacy = await fetchDatabaseNode('simpledo_data');
      const normalized = normalizeFirebaseData(rawLegacy);

      const legacyProfile: UserProfile = {
        id: 'primary',
        username: 'primary',
        email: 'root@simpledo.app',
        displayName: 'Primary Workspace',
        dbPath: 'simpledo_data',
        createdAt: nowIso,
        lastLoginAt: nowIso,
      };

      this.activateSession(legacyProfile, normalized, true);
      return { success: true, user: legacyProfile };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to load primary database.',
      };
    }
  },

  /**
   * Signs out of the current session and returns to the Landing Page
   */
  signOut() {
    clearPersistentAuthStorage();
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  },

  /**
   * Subscribes to authentication state changes
   */
  subscribe(callback: (user: UserProfile | null) => void): () => void {
    const handler = () => {
      callback(this.getCurrentUser());
    };
    window.addEventListener(AUTH_EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  },
};
