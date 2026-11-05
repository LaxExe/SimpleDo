import { useState, useEffect } from 'react';
import { Page } from './types';
import { useSimpleDoData } from './hooks/useSimpleDoData';
import { Navigation } from './components/Navigation';
import { TodayPage } from './pages/TodayPage';
import { InboxPage } from './pages/InboxPage';
import { TrackerPage } from './pages/TrackerPage';
import { AgentsPage } from './pages/AgentsPage';
import { storage, getTodayStr } from './services/storage';
import { subscribeToFirebaseStatus, SyncStatus } from './services/firebase';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('today');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<SyncStatus>('connecting');
  const data = useSimpleDoData();

  useEffect(() => {
    return subscribeToFirebaseStatus((status) => {
      setFirebaseStatus(status);
    });
  }, []);

  // Listen to hash changes (e.g. /#agents, /#.agents, /#database, /#db, /#sync=...)
  useEffect(() => {
    const handleHash = () => {
      // 1. Check if URL contains sync payload from another device / QR code
      if (window.location.hash.startsWith('#sync=')) {
        const encoded = window.location.hash.replace('#sync=', '');
        const success = storage.importFromSyncString(encoded);
        if (success) {
          setSyncNotice('Data successfully synced from your other device!');
          setTimeout(() => setSyncNotice(null), 5000);
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
      }

      // 2. Navigation hash routes
      const hash = window.location.hash.toLowerCase().replace('#', '').replace('/', '');
      if (hash === 'agents' || hash === '.agents' || hash === 'database' || hash === 'db') {
        setCurrentPage('agents');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    // If completely new device (like opening on a phone for the first time), auto-pull from site database
    const hasLocal = localStorage.getItem('simpledo_data_v4');
    if (!hasLocal) {
      storage.pullFromSite();
    }

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const todayStr = getTodayStr();
  const dayPlan = (data.dayPlans && data.dayPlans[todayStr]) || {
    date: todayStr,
    plannedTaskIds: [],
    plannedHabitIds: [],
  };
  const plannedTaskIds = Array.isArray(dayPlan.plannedTaskIds) ? dayPlan.plannedTaskIds : [];
  const plannedHabitIds = Array.isArray(dayPlan.plannedHabitIds) ? dayPlan.plannedHabitIds : [];

  const todayTasksCount = (data.tasks || []).filter(
    (t) =>
      !t.completed &&
      (plannedTaskIds.includes(t.id) || t.scheduledDate === todayStr)
  ).length;

  const pendingTasksCount = (data.tasks || []).filter((t) => !t.completed).length;
  const inboxTasksCount = (data.tasks || []).length;

  const assignedHabitsCount = plannedHabitIds.length;
  const doneAssignedHabitsCount = (data.habits || []).filter(
    (h) => plannedHabitIds.includes(h.id) && Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)
  ).length;

  const habitsTodayDone = {
    done: doneAssignedHabitsCount,
    total: assignedHabitsCount,
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Firebase Locked Mode Notice */}
      {firebaseStatus === 'permission_denied' && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2 text-xs font-mono text-center flex items-center justify-center gap-2 border-b border-amber-600 shadow-2xs z-50">
          <AlertTriangle className="w-4 h-4 text-neutral-950 flex-shrink-0" />
          <span>Firebase Database is in <strong>Locked Mode</strong>. Sync is paused until rules are updated.</span>
          <a
            href="https://console.firebase.google.com/project/simple-do-c5438/database/simple-do-c5438-default-rtdb/rules"
            target="_blank"
            rel="noreferrer"
            className="underline font-bold inline-flex items-center gap-0.5 ml-1 hover:text-black"
          >
            <span>Set rules to true</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Top Header / Navigation */}
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        todayTasksCount={todayTasksCount}
        pendingTasksCount={pendingTasksCount}
        inboxTasksCount={inboxTasksCount}
        habitsTodayDone={habitsTodayDone}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8 pb-28 sm:pb-8">
        {currentPage === 'today' && (
          <TodayPage
            tasks={data.tasks}
            events={data.events || []}
            habits={data.habits}
            inboxes={data.inboxes}
            dayPlans={data.dayPlans}
            onNavigate={setCurrentPage}
          />
        )}

        {(currentPage === 'tasks' || currentPage === 'inbox') && (
          <InboxPage
            tasks={data.tasks}
            events={data.events || []}
            inboxes={data.inboxes}
          />
        )}

        {currentPage === 'tracker' && <TrackerPage habits={data.habits} />}

        {currentPage === 'agents' && <AgentsPage onNavigate={setCurrentPage} />}
      </main>

      {/* Sync Success Notification Banner */}
      {syncNotice && (
        <div className="fixed bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-full shadow-modal text-xs font-mono flex items-center gap-2 animate-fadeIn max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{syncNotice}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#ebebeb] bg-[#fafafa] py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700 lowercase">simple do</span>
            <span>•</span>
            <span>Persistent Habits & Tasks</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('today')}
              className={`hover:text-neutral-900 transition-colors ${
                currentPage === 'today' ? 'text-neutral-900 font-medium' : ''
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentPage('tasks')}
              className={`hover:text-neutral-900 transition-colors ${
                currentPage === 'tasks' || currentPage === 'inbox' ? 'text-neutral-900 font-medium' : ''
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setCurrentPage('tracker')}
              className={`hover:text-neutral-900 transition-colors ${
                currentPage === 'tracker' ? 'text-neutral-900 font-medium' : ''
              }`}
            >
              Tracker
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => setCurrentPage('agents')}
              className={`font-mono transition-colors flex items-center gap-1 ${
                currentPage === 'agents'
                  ? 'text-neutral-900 font-semibold underline'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Autonomous Agent Instructions & Protocol"
            >
              <span>.Agents</span>
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset and clear all data?')) {
                  storage.resetAll();
                }
              }}
              className="hover:text-red-500 transition-colors"
              title="Reset and clear all data"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
