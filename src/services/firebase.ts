import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, off } from 'firebase/database';
import { SimpleDoData } from '../types';

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
 * Syncs local data to Firebase Realtime Database
 */
export async function pushToFirebase(data: SimpleDoData): Promise<boolean> {
  if (isApplyingRemoteChange) return true;

  try {
    const dataRef = ref(rtdb, 'simpledo_data');
    await set(dataRef, data);
    setSyncStatus('connected');
    return true;
  } catch (err: any) {
    if (err?.code === 'PERMISSION_DENIED' || err?.message?.includes('Permission denied')) {
      console.warn('Firebase RTDB Permission Denied. Rules must be set to read: true, write: true');
      setSyncStatus('permission_denied');
    } else {
      console.warn('Firebase push failed:', err);
      setSyncStatus('error');
    }
    return false;
  }
}

/**
 * Initializes two-way real-time listener between Firebase RTDB and local storage
 */
export function initFirebaseSync(
  onRemoteData: (data: SimpleDoData) => void,
  getLocalData: () => SimpleDoData
) {
  const dataRef = ref(rtdb, 'simpledo_data');

  onValue(
    dataRef,
    (snapshot) => {
      const val = snapshot.val();
      setSyncStatus('connected');

      if (val && typeof val === 'object' && Array.isArray(val.tasks)) {
        isApplyingRemoteChange = true;
        try {
          onRemoteData(val as SimpleDoData);
        } finally {
          setTimeout(() => {
            isApplyingRemoteChange = false;
          }, 150);
        }
      } else if (!val) {
        // Database is empty in Firebase: seed it with current local data
        const localData = getLocalData();
        if (localData && (localData.tasks.length > 0 || localData.inboxes.length > 0)) {
          pushToFirebase(localData);
        }
      }
    },
    (err) => {
      if (err?.message?.includes('Permission denied') || (err as any)?.code === 'PERMISSION_DENIED') {
        setSyncStatus('permission_denied');
      } else {
        setSyncStatus('error');
      }
    }
  );

  return () => {
    off(dataRef);
  };
}
