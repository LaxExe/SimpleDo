import { useState } from 'react';
import { Page } from './types';
import { useSimpleDoData } from './hooks/useSimpleDoData';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { InboxPage } from './pages/InboxPage';
import { TrackerPage } from './pages/TrackerPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const data = useSimpleDoData();

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasksCount = data.tasks.filter((t) => !t.completed).length;
  const inboxCount = data.inbox.length;
  const habitsTodayDone = {
    done: data.habits.filter((h) => h.completedDates.includes(todayStr)).length,
    total: data.habits.length,
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top Header / Navigation */}
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        pendingTasksCount={pendingTasksCount}
        inboxCount={inboxCount}
        habitsTodayDone={habitsTodayDone}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentPage === 'home' && (
          <HomePage
            tasks={data.tasks}
            habits={data.habits}
            inboxCount={inboxCount}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'tasks' && <TasksPage tasks={data.tasks} />}

        {currentPage === 'inbox' && (
          <InboxPage
            inbox={data.inbox}
            onNavigateToTasks={() => setCurrentPage('tasks')}
          />
        )}

        {currentPage === 'tracker' && <TrackerPage habits={data.habits} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ebebeb] bg-[#fafafa] py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-600">SimpleDo</span>
            <span>•</span>
            <span>Persistent Habits & Tasks</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="hover:text-neutral-900 transition-colors"
            >
              Home
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
