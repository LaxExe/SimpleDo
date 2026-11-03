import { useState, useEffect } from 'react';
import { Page } from './types';
import { useSimpleDoData } from './hooks/useSimpleDoData';
import { Navigation } from './components/Navigation';
import { TodayPage } from './pages/TodayPage';
import { TasksPage } from './pages/TasksPage';
import { InboxPage } from './pages/InboxPage';
import { TrackerPage } from './pages/TrackerPage';
import { AgentsPage } from './pages/AgentsPage';
import { storage, getTodayStr } from './services/storage';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('today');
  const data = useSimpleDoData();

  // Listen to hash changes (e.g. /#agents or /#.agents)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '').replace('/', '');
      if (hash === 'agents' || hash === '.agents') {
        setCurrentPage('agents');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const todayStr = getTodayStr();
  const dayPlan = data.dayPlans[todayStr] || {
    date: todayStr,
    plannedTaskIds: [],
    plannedHabitIds: [],
  };

  const todayTasksCount = data.tasks.filter(
    (t) =>
      !t.completed &&
      (dayPlan.plannedTaskIds.includes(t.id) ||
        t.scheduledDate === todayStr ||
        t.dueDate === todayStr)
  ).length;

  const pendingTasksCount = data.tasks.filter((t) => !t.completed).length;
  const inboxTasksCount = data.tasks.length;

  const assignedHabitsCount = dayPlan.plannedHabitIds.length;
  const doneAssignedHabitsCount = data.habits.filter(
    (h) => dayPlan.plannedHabitIds.includes(h.id) && h.completedDates.includes(todayStr)
  ).length;

  const habitsTodayDone = {
    done: doneAssignedHabitsCount,
    total: assignedHabitsCount,
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-neutral-900 selection:bg-neutral-900 selection:text-white">
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
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

        {currentPage === 'tasks' && (
          <TasksPage tasks={data.tasks} inboxes={data.inboxes} />
        )}

        {currentPage === 'inbox' && (
          <InboxPage
            tasks={data.tasks}
            events={data.events || []}
            inboxes={data.inboxes}
          />
        )}

        {currentPage === 'tracker' && <TrackerPage habits={data.habits} />}

        {currentPage === 'agents' && <AgentsPage onNavigate={setCurrentPage} />}
      </main>

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
                currentPage === 'tasks' ? 'text-neutral-900 font-medium' : ''
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setCurrentPage('inbox')}
              className={`hover:text-neutral-900 transition-colors ${
                currentPage === 'inbox' ? 'text-neutral-900 font-medium' : ''
              }`}
            >
              Inbox
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
