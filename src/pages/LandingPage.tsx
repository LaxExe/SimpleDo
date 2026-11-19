import React, { useState } from 'react';
import { StarterTemplate, UserProfile } from '../types';
import { auth, normalizeUserKey } from '../services/auth';
import {
  Sun,
  Activity,
  Database,
  CheckCircle2,
  Circle,
  Check,
  Flame,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  currentUser: UserProfile | null;
  onAuthenticated: (user: UserProfile) => void;
  onEnterWorkspace?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onAuthenticated,
  onEnterWorkspace,
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Sign Up State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [template, setTemplate] = useState<StarterTemplate>('starter');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Interactive Preview State
  const [demoTasks, setDemoTasks] = useState([
    {
      id: 'demo-1',
      title: 'Click this task to step through its 4-part progress bar',
      inbox: 'Product',
      color: '#0070f3',
      completed: false,
      hasProgress: true,
      completedParts: 2,
      plannedToday: true,
    },
    {
      id: 'demo-2',
      title: 'Finish Calculus problem set',
      inbox: 'Math',
      color: '#f59e0b',
      completed: false,
      hasProgress: false,
      completedParts: 0,
      plannedToday: false,
    },
  ]);

  const [demoHabitDone, setDemoHabitDone] = useState(false);

  const previewUserKey = normalizeUserKey(username || displayName || 'username') || 'username';

  const handleCycleDemoProgress = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.hasProgress) {
          return { ...t, hasProgress: true, completedParts: 0 };
        }
        if (t.completedParts < 4) {
          return { ...t, completedParts: t.completedParts + 1 };
        }
        return { ...t, hasProgress: false, completedParts: 0 };
      })
    );
  };

  const handleToggleDemoComplete = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedParts: !t.completed ? 4 : 0,
            }
          : t
      )
    );
  };

  const handleToggleDemoToday = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, plannedToday: !t.plannedToday } : t))
    );
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await auth.signUp({
        displayName,
        username: username || displayName,
        email,
        password,
        template,
      });

      if (!res.success || !res.user) {
        setAuthError(res.error || 'Could not create account.');
      } else {
        onAuthenticated(res.user);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await auth.signIn({
        identifier: loginIdentifier,
        password: loginPassword,
      });

      if (!res.success || !res.user) {
        setAuthError(res.error || 'Invalid credentials.');
      } else {
        onAuthenticated(res.user);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectLegacy = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await auth.connectLegacyWorkspace();
      if (res.success && res.user) {
        onAuthenticated(res.user);
      } else {
        setAuthError(res.error || 'Could not connect to database.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb] pt-safe">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between">
          <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-900 lowercase select-none">
            simple do
          </span>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={onEnterWorkspace}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-all active:scale-95 shadow-subtle"
              >
                <span>Open App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center p-0.5 bg-[#ebebeb]/60 rounded-full border border-[#ebebeb] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-all active:scale-95 ${
                    authMode === 'signup'
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 font-normal'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-all active:scale-95 ${
                    authMode === 'signin'
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 font-normal'
                  }`}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn">
        {/* Hero & Auth Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Clean Minimal Explanation & 4 Compact Tiles */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                Tasks, habits, and daily focus.
              </h1>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
                A simple workspace to plan your day, organize tasks by inbox, and build habits—stored in the cloud and synced live across your devices.
              </p>
            </div>

            {/* 4 Minimal Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#171717', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Sun className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>Today</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Focus only on today. Drag tasks from your pool onto your daily list or calendar.
                </p>
              </div>

              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#0070f3', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Layers className="w-3.5 h-3.5 text-[#0070f3] stroke-[2.5]" />
                  <span>To Do &amp; Inboxes</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Sort tasks and events by color-coded inboxes with 4-step progress bars.
                </p>
              </div>

              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#10b981', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Activity className="w-3.5 h-3.5 text-[#10b981] stroke-[2.5]" />
                  <span>Tracker</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Flexible habit streaks that only count days you schedule. Rest days never reset you.
                </p>
              </div>

              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#8b5cf6', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Database className="w-3.5 h-3.5 text-[#8b5cf6] stroke-[2.5]" />
                  <span>Cloud &amp; Agents</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Synced to Firebase in real time with a direct JSON endpoint for AI agents.
                </p>
              </div>
            </div>

            {/* Compact Interactive Preview */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Interactive preview</span>
                <span>Click a task title to step progress</span>
              </div>

              <div
                className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle overflow-hidden"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#0070f3', borderLeftStyle: 'solid' }}
              >
                <ul className="divide-y divide-[#ebebeb]/70">
                  {demoTasks.map((task) => (
                    <li
                      key={task.id}
                      className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDemoComplete(task.id)}
                          className="flex-shrink-0 transition-transform active:scale-95"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-neutral-900 fill-neutral-200" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            onClick={() => handleCycleDemoProgress(task.id)}
                            className={`text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${
                              task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                            }`}
                          >
                            {task.title}
                          </p>

                          {task.hasProgress && (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex items-center gap-1 w-24">
                                {[1, 2, 3, 4].map((part) => (
                                  <button
                                    key={part}
                                    type="button"
                                    onClick={() => handleCycleDemoProgress(task.id)}
                                    className={`h-1 flex-1 rounded-full transition-all ${
                                      part <= task.completedParts
                                        ? 'bg-neutral-900'
                                        : 'bg-neutral-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {task.completedParts}/4
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-700 bg-white border border-[#ebebeb] px-2 py-0.5 rounded shadow-2xs">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.color }}
                          />
                          <span>{task.inbox}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleDemoToday(task.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded transition-all active:scale-95 ${
                            task.plannedToday
                              ? 'bg-green-50 text-green-700 border border-green-200/80 shadow-2xs'
                              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent'
                          }`}
                        >
                          {task.plannedToday ? (
                            <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                          ) : (
                            <Sun className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span>Today</span>
                        </button>
                      </div>
                    </li>
                  ))}

                  {/* Habit row inside preview */}
                  <li className="p-3 sm:px-4 flex items-center justify-between gap-3 bg-[#fafafa]/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setDemoHabitDone(!demoHabitDone)}
                        className={`w-4 h-4 rounded flex items-center justify-center transition-all active:scale-95 ${
                          demoHabitDone
                            ? 'bg-neutral-900 text-white'
                            : 'bg-white border border-neutral-300 hover:border-neutral-900'
                        }`}
                      >
                        {demoHabitDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span
                        className={`text-xs font-medium truncate ${
                          demoHabitDone ? 'line-through text-neutral-400' : 'text-neutral-900'
                        }`}
                      >
                        Daily Deep Work Habit
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-600" />
                      <span>{demoHabitDone ? 8 : 7}d</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Clean Sign Up / Sign In Form Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
                <span className="text-xs font-semibold text-neutral-900">
                  {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                </span>

                <div className="flex items-center p-0.5 bg-[#ebebeb]/60 rounded-full border border-[#ebebeb] text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs transition-all active:scale-95 ${
                      authMode === 'signup'
                        ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900 font-normal'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthError(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs transition-all active:scale-95 ${
                      authMode === 'signin'
                        ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900 font-normal'
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-md bg-red-50 border border-red-200/80 text-xs text-red-600">
                  {authError}
                </div>
              )}

              {authMode === 'signup' ? (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="alex"
                        className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@email.com"
                        className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Template
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as StarterTemplate)}
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 cursor-pointer"
                    >
                      <option value="starter">Starter Workspace</option>
                      <option value="student">Student &amp; Courses</option>
                      <option value="blank">Blank</option>
                      <option value="import_legacy">Import Root DB</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-[#ebebeb] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-neutral-400 truncate">
                      /users/{previewUserKey}
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-all active:scale-95 disabled:opacity-40 shadow-subtle"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="alex"
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#ebebeb] flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-all active:scale-95 disabled:opacity-40 shadow-subtle"
                    >
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[11px] text-neutral-400">
                <span>Existing database</span>
                <button
                  type="button"
                  onClick={handleConnectLegacy}
                  disabled={isSubmitting}
                  className="font-mono text-neutral-600 hover:text-neutral-900 underline transition-colors"
                >
                  Open Root DB
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#ebebeb] bg-[#fafafa] py-5 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700 lowercase">simple do</span>
            <span>•</span>
            <span>Tasks &amp; Habits</span>
          </div>
          <button
            type="button"
            onClick={handleConnectLegacy}
            className="font-mono hover:text-neutral-900 transition-colors"
          >
            Root DB
          </button>
        </div>
      </footer>
    </div>
  );
};
