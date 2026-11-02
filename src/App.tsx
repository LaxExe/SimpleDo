import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './pages/DashboardView';
import { GoalsView } from './pages/GoalsView';
import { HabitsView } from './pages/HabitsView';
import { InboxesView } from './pages/InboxesView';
import { DailyReviewView } from './pages/DailyReviewView';
import { SettingsView } from './pages/SettingsView';

import { AppData, Goal, Habit, Inbox, Priority } from './types';
import { INITIAL_DATA } from './data/initialData';
import {
  loadAppData,
  saveAppData,
  performEndOfDaySweep,
  getTodayDateString,
} from './services/storage';

const DEFAULT_SIDEBAR_ORDER = [
  'dashboard',
  'goals',
  'habits',
  'inboxes',
  'review',
  'settings',
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [appData, setAppData] = useState<AppData>(INITIAL_DATA);
  const [diskSyncStatus, setDiskSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [selectedInboxForFilter, setSelectedInboxForFilter] = useState<string | undefined>(undefined);

  // Load disk or local data on mount
  useEffect(() => {
    async function init() {
      const res = await loadAppData();
      setAppData(res.data);
      setDiskSyncStatus(res.source === 'disk' ? 'synced' : 'offline');

      // Sync theme with document
      const theme = res.data.settings?.theme || 'light';
      document.documentElement.setAttribute('data-theme', theme);
    }
    init();
  }, []);

  // Update document theme when settings change
  useEffect(() => {
    const theme = appData.settings?.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, [appData.settings?.theme]);

  // Persist data whenever it changes
  const persist = useCallback(async (newData: AppData) => {
    setAppData(newData);
    setDiskSyncStatus('saving');
    const { diskSaved } = await saveAppData(newData);
    setDiskSyncStatus(diskSaved ? 'synced' : 'offline');
  }, []);

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = appData.settings?.theme === 'dark' ? 'light' : 'dark';
    const updated: AppData = {
      ...appData,
      settings: {
        ...appData.settings,
        theme: nextTheme,
      },
    };
    persist(updated);
  };

  // Reorder Sidebar
  const handleReorderSidebar = (newOrder: string[]) => {
    const updated: AppData = {
      ...appData,
      settings: {
        ...appData.settings,
        sidebarOrder: newOrder,
      },
    };
    persist(updated);
  };

  // Goal Actions
  const handleAddGoal = (title: string, inboxId: string, priority: Priority = 'medium', notes?: string) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      notes,
      inboxId,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated: AppData = {
      ...appData,
      goals: [newGoal, ...appData.goals],
    };
    persist(updated);
  };

  const handleToggleGoal = (id: string) => {
    const updatedGoals = appData.goals.map((g) => {
      if (g.id !== id) return g;
      const isComplete = !g.completed;
      return {
        ...g,
        completed: isComplete,
        completedAt: isComplete ? new Date().toISOString() : undefined,
      };
    });
    persist({ ...appData, goals: updatedGoals });
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = appData.goals.filter((g) => g.id !== id);
    persist({ ...appData, goals: updatedGoals });
  };

  const handleClearCompletedGoals = () => {
    const updatedGoals = appData.goals.filter((g) => !g.completed);
    persist({ ...appData, goals: updatedGoals });
  };

  // Habit Actions
  const handleAddHabit = (title: string, inboxId: string, description?: string) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      inboxId,
      streak: 0,
      bestStreak: 0,
      history: {},
      createdAt: new Date().toISOString(),
    };
    persist({ ...appData, habits: [...appData.habits, newHabit] });
  };

  const handleToggleHabit = (id: string) => {
    const today = getTodayDateString();
    const updatedHabits = appData.habits.map((h) => {
      if (h.id !== id) return h;
      const isCurrentlyDone = Boolean(h.history[today]);
      const nextDone = !isCurrentlyDone;

      const newHistory = { ...h.history };
      if (nextDone) {
        newHistory[today] = true;
      } else {
        delete newHistory[today];
      }

      const nextStreak = nextDone ? h.streak + 1 : Math.max(0, h.streak - 1);
      const nextBest = Math.max(h.bestStreak, nextStreak);

      return {
        ...h,
        history: newHistory,
        streak: nextStreak,
        bestStreak: nextBest,
      };
    });
    persist({ ...appData, habits: updatedHabits });
  };

  const handleDeleteHabit = (id: string) => {
    const updatedHabits = appData.habits.filter((h) => h.id !== id);
    persist({ ...appData, habits: updatedHabits });
  };

  // Inbox Actions
  const handleAddInbox = (name: string, description?: string, color: string = '#3b82f6') => {
    const newInbox: Inbox = {
      id: `inbox-${Date.now()}`,
      name,
      description,
      color,
      createdAt: new Date().toISOString(),
    };
    persist({ ...appData, inboxes: [...appData.inboxes, newInbox] });
  };

  const handleDeleteInbox = (id: string) => {
    // Reassign any goals in this inbox to 'quick'
    const updatedGoals = appData.goals.map((g) =>
      g.inboxId === id ? { ...g, inboxId: 'quick' } : g
    );
    const updatedInboxes = appData.inboxes.filter((ib) => ib.id !== id);
    persist({ ...appData, inboxes: updatedInboxes, goals: updatedGoals });
  };

  // End of Day Sweep Action
  const handlePerformSweep = (reflection: string) => {
    const updated = performEndOfDaySweep(appData, reflection);
    persist(updated);
  };

  // Switch tabs helper with optional inbox filter
  const handleSelectTab = (tab: string, filterId?: string) => {
    if (filterId) {
      setSelectedInboxForFilter(filterId);
    }
    setActiveTab(tab);
  };

  // Counts
  const pendingGoalsCount = appData.goals.filter((g) => !g.completed).length;
  const completedGoalsCount = appData.goals.filter((g) => g.completed).length;
  const today = getTodayDateString();
  const habitsDueCount = appData.habits.filter((h) => !h.history[today]).length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--c5)] flex flex-col transition-colors">
      {/* Top Header */}
      <Header
        theme={appData.settings?.theme || 'light'}
        onToggleTheme={handleToggleTheme}
        onOpenDailyReview={() => setActiveTab('review')}
        completedGoalsCount={completedGoalsCount}
        diskSyncStatus={diskSyncStatus}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1400px] w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedInboxForFilter(undefined);
            setActiveTab(tab);
          }}
          pendingGoalsCount={pendingGoalsCount}
          habitsDueCount={habitsDueCount}
          sidebarOrder={appData.settings?.sidebarOrder || DEFAULT_SIDEBAR_ORDER}
          onReorderSidebar={handleReorderSidebar}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              goals={appData.goals}
              habits={appData.habits}
              inboxes={appData.inboxes}
              onAddGoal={handleAddGoal}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              onToggleHabit={handleToggleHabit}
              onDeleteHabit={handleDeleteHabit}
              onOpenDailyReview={() => setActiveTab('review')}
              onSelectTab={handleSelectTab}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={appData.goals}
              inboxes={appData.inboxes}
              onAddGoal={handleAddGoal}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              onClearCompleted={handleClearCompletedGoals}
              initialInboxFilter={selectedInboxForFilter}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsView
              habits={appData.habits}
              inboxes={appData.inboxes}
              onAddHabit={handleAddHabit}
              onToggleHabit={handleToggleHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {activeTab === 'inboxes' && (
            <InboxesView
              inboxes={appData.inboxes}
              goals={appData.goals}
              habits={appData.habits}
              onAddInbox={handleAddInbox}
              onDeleteInbox={handleDeleteInbox}
              onAddGoal={(title, inboxId) => handleAddGoal(title, inboxId, 'medium')}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              selectedInboxId={selectedInboxForFilter}
            />
          )}

          {activeTab === 'review' && (
            <DailyReviewView
              goals={appData.goals}
              habits={appData.habits}
              dailyLogs={appData.dailyLogs}
              onPerformSweep={handlePerformSweep}
              onClearIndividualGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              appData={appData}
              onUpdateSettings={(settings) => persist({ ...appData, settings })}
              onImportData={(imported) => persist(imported)}
              onResetData={() => persist(INITIAL_DATA)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
