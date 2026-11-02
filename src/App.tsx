import { useState } from 'react';
import { Page } from './types';
import { useSimpleDoData } from './hooks/useSimpleDoData';
import { Navigation } from './components/Navigation';
import { TodayPage } from './pages/TodayPage';
import { TasksPage } from './pages/TasksPage';
import { InboxPage } from './pages/InboxPage';
import { TrackerPage } from './pages/TrackerPage';
import { getTodayStr } from './services/storage';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('today');
  const data = useSimpleDoData();

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
          <InboxPage tasks={data.tasks} inboxes={data.inboxes} />
        )}

        {currentPage === 'tracker' && <TrackerPage habits={data.habits} />}
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
              className="hover:text-neutral-900 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentPage('tasks')}
              className="hover:text-neutral-900 transition-colors"
            >
              Tasks
            </button>
            <button
              onClick={() => setCurrentPage('inbox')}
              className="hover:text-neutral-900 transition-colors"
            >
              Inbox
            </button>
            <button
              onClick={() => setCurrentPage('tracker')}
              className="hover:text-neutral-900 transition-colors"
            >
              Tracker
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
