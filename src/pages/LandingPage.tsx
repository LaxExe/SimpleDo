import React, { useState } from 'react';
import { StarterTemplate, UserProfile } from '../types';
import { auth, normalizeUserKey } from '../services/auth';
import { firebaseConfig } from '../services/firebase';
import {
  Sun,
  CheckSquare,
  Activity,
  Bot,
  Database,
  CheckCircle2,
  Circle,
  Check,
  Flame,
  ArrowRight,
  UserPlus,
  LogIn,
  Layers,
  Terminal,
  Calendar,
  Copy,
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
  // Auth mode: 'signup' vs 'signin'
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
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Interactive Live Sandbox State on Landing Page
  const [demoTasks, setDemoTasks] = useState([
    {
      id: 'demo-1',
      title: 'Click this title to cycle the 4-part segmented progress bar',
      inbox: 'Product & Engineering',
      color: '#0070f3',
      priority: 'high' as const,
      completed: false,
      hasProgress: true,
      completedParts: 2,
      plannedToday: true,
      dueToday: false,
    },
    {
      id: 'demo-2',
      title: 'Finalize cloud database schema & real-time RTDB listeners',
      inbox: 'Systems Architecture',
      color: '#10b981',
      priority: 'high' as const,
      completed: false,
      hasProgress: true,
      completedParts: 3,
      plannedToday: true,
      dueToday: true,
    },
    {
      id: 'demo-3',
      title: 'Complete Calculus Week 5 problem set',
      inbox: 'Mathematics',
      color: '#f59e0b',
      priority: 'medium' as const,
      completed: false,
      hasProgress: false,
      completedParts: 0,
      plannedToday: false,
      dueToday: false,
    },
  ]);

  const [demoHabitDone, setDemoHabitDone] = useState(false);

  const previewUserKey = normalizeUserKey(username || displayName || 'your_username') || 'your_username';
  const previewEndpoint = `${firebaseConfig.databaseURL}/users/${previewUserKey}/data.json`;

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
        setAuthError(res.error || 'Could not connect to primary database.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToAuth = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setAuthError(null);
    const el = document.getElementById('auth-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Sticky Minimalist Header */}
      <header className="sticky top-0 z-40 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb] pt-safe">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-900 lowercase select-none">
              simple do
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white border border-[#ebebeb] text-neutral-600 shadow-2xs">
              Cloud Platform
            </span>
          </div>

          {/* Section Links */}
          <nav className="hidden md:flex items-center p-1 bg-[#ebebeb]/60 rounded-full border border-[#ebebeb] text-xs">
            <a
              href="#overview"
              className="px-3 py-1 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white/60 transition-all"
            >
              What It Is
            </a>
            <a
              href="#sandbox"
              className="px-3 py-1 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white/60 transition-all"
            >
              Interactive Preview
            </a>
            <a
              href="#pillars"
              className="px-3 py-1 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white/60 transition-all"
            >
              4 Core Systems
            </a>
            <a
              href="#database"
              className="px-3 py-1 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-white/60 transition-all"
            >
              Database & Agents
            </a>
          </nav>

          {/* Right Auth Actions */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={onEnterWorkspace}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-all active:scale-95 shadow-subtle"
              >
                <span>Open Workspace (@{currentUser.username})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => scrollToAuth('signin')}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-full transition-all active:scale-95"
                >
                  Sign In
                </button>
                <button
                  onClick={() => scrollToAuth('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-all active:scale-95 shadow-subtle"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-16 sm:space-y-20 animate-fadeIn">
        {/* ============================================================ */}
        {/* 1. HERO & SIGN UP / SIGN IN SPLIT SECTION                    */}
        {/* ============================================================ */}
        <section id="overview" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (7 cols): Platform Explanation & Philosophy */}
          <div className="lg:col-span-7 space-y-6 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#ebebeb] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-medium text-neutral-600">
                REAL-TIME CLOUD DATABASE • &lt;50MS MULTI-DEVICE SYNC
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.12]">
                High-signal daily execution for humans and AI agents.
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                <strong className="text-neutral-900 font-semibold">simple do</strong> is a minimalist, cloud-backed productivity workspace built on zero cognitive noise. It unifies intentional daily planning, color-coded project inboxes, 4-stage segmented task progress, forgiving habit streaks, and a direct REST database API for autonomous agents.
              </p>
            </div>

            {/* 4 Key Architectural Facts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1.5"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#171717', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Sun className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>Intentional Today View</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Separate your backlog from today’s execution. Drag tasks and habits into Today or onto the full-width monthly calendar.
                </p>
              </div>

              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1.5"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#0070f3', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Layers className="w-3.5 h-3.5 text-[#0070f3] stroke-[2.5]" />
                  <span>Multi-Inbox &amp; 4-Part Progress</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Group work into 10-color semantic inboxes. Click any task title to cycle a 4-stage fraction progress bar (`0/4` to `4/4`).
                </p>
              </div>

              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1.5"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#10b981', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Activity className="w-3.5 h-3.5 text-[#10b981] stroke-[2.5]" />
                  <span>Schedule-Aware Habit Streaks</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Only days where you intentionally schedule a habit count toward your streak. Rest days never break your streak.
                </p>
              </div>

              <div
                className="bg-white p-4 rounded-xl border border-[#ebebeb] shadow-subtle space-y-1.5"
                style={{ borderLeftWidth: '4px', borderLeftColor: '#8b5cf6', borderLeftStyle: 'solid' }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <Database className="w-3.5 h-3.5 text-[#8b5cf6] stroke-[2.5]" />
                  <span>100% Stored in Cloud DB</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Every account gets a dedicated Firebase Realtime Database path (`/users/you/data.json`) accessible from phone, laptop, or AI agent.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sign Up / Sign In Form Card */}
          <div id="auth-panel" className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-[#ebebeb] shadow-modal p-5 sm:p-6 space-y-5">
              {/* Top Header + Mode Switcher Pill */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#ebebeb]">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    {authMode === 'signup' ? 'Create Your Account' : 'Sign In to Workspace'}
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    {authMode === 'signup'
                      ? 'Stored & synced live in the cloud database'
                      : 'Access your synced tasks, inboxes & habits'}
                  </p>
                </div>

                {/* Segmented Pill Toggle */}
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
                <div className="p-3 rounded-lg bg-red-50 border border-red-200/80 text-xs text-red-700 font-medium">
                  {authError}
                </div>
              )}

              {authMode === 'signup' ? (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
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
                        className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors font-mono shadow-2xs"
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
                        placeholder="alex@domain.com"
                        className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
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
                      placeholder="At least 4 characters"
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Initial Workspace Setup
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as StarterTemplate)}
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 cursor-pointer"
                    >
                      <option value="starter">Guided Starter Workspace (Recommended)</option>
                      <option value="student">Academic &amp; Coursework Inboxes</option>
                      <option value="blank">Clean Blank Workspace</option>
                      <option value="import_legacy">Copy from Existing Root DB (/simpledo_data)</option>
                    </select>
                  </div>

                  {/* Live Database Path Preview */}
                  <div className="p-2.5 rounded-md bg-[#fafafa] border border-[#ebebeb] space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                      <span>YOUR CLOUD DATABASE PATH</span>
                      <span className="text-emerald-600 font-semibold">● Live RTDB</span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-800 truncate">
                      /users/{previewUserKey}/data.json
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#ebebeb] flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-all active:scale-95 disabled:opacity-50 shadow-subtle flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Creating Cloud Account...' : 'Create Account & Launch Workspace'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="alex or alex@domain.com"
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
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
                      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#ebebeb] flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-all active:scale-95 disabled:opacity-50 shadow-subtle flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Signing In...' : 'Sign In to Cloud Workspace'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Access to Primary / Legacy Root Database */}
              <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between gap-2 text-[11px] text-neutral-500">
                <span>Returning owner of root DB?</span>
                <button
                  type="button"
                  onClick={handleConnectLegacy}
                  disabled={isSubmitting}
                  className="font-mono font-medium text-neutral-700 hover:text-neutral-900 underline transition-colors"
                >
                  Open Root Workspace (/simpledo_data)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. INTERACTIVE SANDBOX: TRY SIMPLED0 MECHANICS LIVE          */}
        {/* ============================================================ */}
        <section id="sandbox" className="space-y-4 pt-4 border-t border-[#ebebeb]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-medium text-neutral-500 uppercase tracking-wider">
                Interactive Component Sandbox
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 mt-0.5">
                Test the core mechanics right here
              </h2>
            </div>
            <p className="text-xs text-neutral-500 font-mono">
              Click any task title below to cycle its 4-stage progress bar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Interactive Task Card Demo (8 cols) */}
            <div
              className="lg:col-span-8 bg-white rounded-xl border border-[#ebebeb] shadow-subtle overflow-hidden"
              style={{ borderLeftWidth: '4px', borderLeftColor: '#0070f3', borderLeftStyle: 'solid' }}
            >
              <div
                className="px-4 py-3 sm:px-5 flex items-center justify-between border-b border-[#ebebeb]"
                style={{ backgroundColor: '#0070f312' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0070f3]" />
                  <span className="text-xs sm:text-sm font-semibold text-neutral-900 tracking-tight">
                    Interactive Inbox Region Preview
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-white border border-[#ebebeb] text-neutral-700 shadow-2xs">
                  {demoTasks.filter((t) => !t.completed).length} active
                </span>
              </div>

              <ul className="divide-y divide-[#ebebeb]/70">
                {demoTasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors"
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
                          <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-600" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          onClick={() => handleCycleDemoProgress(task.id)}
                          className={`text-xs sm:text-sm font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${
                            task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                          }`}
                        >
                          {task.title}
                        </p>

                        {/* 4-Stage Progress Bar */}
                        {task.hasProgress && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex items-center gap-1 w-28">
                              {[1, 2, 3, 4].map((part) => (
                                <button
                                  key={part}
                                  type="button"
                                  onClick={() => handleCycleDemoProgress(task.id)}
                                  className={`h-1.5 flex-1 rounded-full transition-all ${
                                    part <= task.completedParts
                                      ? 'bg-neutral-900'
                                      : 'bg-neutral-200 hover:bg-neutral-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500">
                              {task.completedParts}/4
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.dueToday && !task.completed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-200/50">
                          Due Today
                        </span>
                      )}

                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-neutral-700 bg-white border border-[#ebebeb] px-2 py-0.5 rounded shadow-2xs">
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
              </ul>
            </div>

            {/* Interactive Habit Streak Card Demo (4 cols) */}
            <div
              className="lg:col-span-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 flex flex-col justify-between space-y-4"
              style={{ borderLeftWidth: '4px', borderLeftColor: '#10b981', borderLeftStyle: 'solid' }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-neutral-500">
                    SCHEDULE-AWARE STREAK
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    <span>{demoHabitDone ? 8 : 7}d streak</span>
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Forgiving Habit Tracker
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Only days where a habit is dragged into your Day Plan are evaluated. Unscheduled rest days never break your streak.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#ebebeb] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setDemoHabitDone(!demoHabitDone)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all active:scale-95 ${
                      demoHabitDone
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white border border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {demoHabitDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-medium truncate ${
                        demoHabitDone ? 'line-through text-neutral-400' : 'text-neutral-900'
                      }`}
                    >
                      60m Deep Work Session
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Scheduled for Today
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoHabitDone(!demoHabitDone)}
                  className="text-[11px] font-mono text-neutral-600 hover:text-neutral-900 underline flex-shrink-0"
                >
                  {demoHabitDone ? 'Undo' : 'Complete'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. DETAILED EXPLANATION OF THE 4 CORE SYSTEMS                */}
        {/* ============================================================ */}
        <section id="pillars" className="space-y-6 pt-4 border-t border-[#ebebeb]">
          <div>
            <div className="text-[11px] font-mono font-medium text-neutral-500 uppercase tracking-wider">
              System Architecture
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 mt-0.5">
              How SimpleDo organizes your work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* System 1: Today */}
            <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-[#ebebeb]">
                  01 / TODAY &amp; CALENDAR
                </span>
                <Calendar className="w-4 h-4 text-neutral-500" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Intentional Daily Execution Shelf
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Traditional task managers overwhelm you with every task you have ever written. SimpleDo keeps your **Today** view clean: you curate your day by dragging tasks and habits from the horizontal **Planning Pool** into Today or dropping them onto any date on the full-width **Monthly Calendar**.
              </p>
              <ul className="space-y-1.5 pt-1 text-xs text-neutral-600 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>Full-solid colored urgency cards for tasks due today</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>One-click defer to tomorrow or return to backlog</span>
                </li>
              </ul>
            </div>

            {/* System 2: Inboxes & To Do */}
            <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-[#ebebeb]">
                  02 / INBOX HUB &amp; TO DO
                </span>
                <CheckSquare className="w-4 h-4 text-neutral-500" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                10-Color Semantic Inboxes &amp; Events
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Create dedicated **Inboxes** for each course, project, or area of responsibility using a calibrated 10-color palette. Each inbox holds both actionable **Tasks** (with 4-part fraction progress bars) and calendar **Events** (lectures, meetings, deadlines) with collapsible archives.
              </p>
              <ul className="space-y-1.5 pt-1 text-xs text-neutral-600 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>Sort by Inbox Region, Due Date, Priority, or Newest</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>5-state progress cycle: hidden → 0/4 → 1/4 → 2/4 → 3/4 → 4/4</span>
                </li>
              </ul>
            </div>

            {/* System 3: Habit Tracker */}
            <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-[#ebebeb]">
                  03 / HABIT TRACKER
                </span>
                <Activity className="w-4 h-4 text-neutral-500" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                14-Day Completion Matrix &amp; Smart Streaks
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Track daily and weekday habits across an interactive 14-day history grid. Because streaks are computed against your **Day Plans**, taking an unplanned rest day never resets your progress—only missed scheduled days break a streak.
              </p>
              <ul className="space-y-1.5 pt-1 text-xs text-neutral-600 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>Tracks both current active streak and all-time best streak</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>Backfill past dates directly from the 14-day matrix</span>
                </li>
              </ul>
            </div>

            {/* System 4: Autonomous Agents & Database */}
            <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-neutral-900 text-white">
                  04 / .AGENTS &amp; CLOUD DB
                </span>
                <Bot className="w-4 h-4 text-neutral-900" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Built for Autonomous AI Agents
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Every user account is backed by a real-time JSON tree in Firebase Realtime Database. Give Claude, ChatGPT, Gemini, or a cron script your account’s REST endpoint and it can read your schedule, create tasks, or plan your day via standard HTTP `GET` and `PUT`.
              </p>
              <ul className="space-y-1.5 pt-1 text-xs text-neutral-600 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>Zero dependencies or browser automation needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
                  <span>In-app live JSON database editor &amp; JS console</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. DATABASE STORAGE & AGENT API SPECIFICATION                */}
        {/* ============================================================ */}
        <section id="database" className="space-y-5 pt-4 border-t border-[#ebebeb]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-medium text-neutral-500 uppercase tracking-wider">
                Cloud Persistence &amp; Agent Protocol
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 mt-0.5">
                Everything is stored in the database
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              Firebase Realtime Database (`simple-do-c5438`)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Database Schema Card (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                <Database className="w-4 h-4 text-neutral-900" />
                <span>Multi-User Cloud Database Tree</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                When you sign up, your profile and workspace are written directly to the cloud database and synchronized across every browser and mobile device you sign into:
              </p>
              <pre className="p-3.5 rounded-lg bg-[#fafafa] border border-[#ebebeb] text-[11px] font-mono text-neutral-800 overflow-x-auto leading-relaxed">
{`{
  "users": {
    "${previewUserKey}": {
      "profile": {
        "id": "${previewUserKey}",
        "displayName": "${displayName || 'Alex Rivera'}",
        "dbPath": "users/${previewUserKey}/data"
      },
      "data": {
        "tasks": [ ... ],
        "inboxes": [ ... ],
        "events": [ ... ],
        "habits": [ ... ],
        "dayPlans": { "YYYY-MM-DD": ... }
      }
    }
  }
}`}
              </pre>
            </div>

            {/* Direct REST API Preview (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                    <Terminal className="w-4 h-4 text-neutral-900" />
                    <span>Direct HTTP REST Endpoint for Your Account</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -s "${previewEndpoint}"`);
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-neutral-600 hover:text-neutral-900 bg-[#fafafa] hover:bg-neutral-100 border border-[#ebebeb] rounded-md transition-colors"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  Any AI agent or script can read or update your personal workspace in real time using standard HTTP requests—updates reflect on your screen in under 50ms:
                </p>

                <pre className="p-3.5 rounded-lg bg-neutral-900 text-neutral-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
{`# 1. Read your entire live workspace (Tasks, Inboxes, Habits, Day Plans)
curl -s "${previewEndpoint}"

# 2. Push an updated workspace from Python, Claude, or cron
curl -X PUT "${previewEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d @workspace.json`}
                </pre>
              </div>

              <div className="pt-3 border-t border-[#ebebeb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-neutral-500">
                  Ready to set up your personal cloud workspace?
                </span>
                <button
                  type="button"
                  onClick={() => scrollToAuth('signup')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-all active:scale-95 shadow-subtle"
                >
                  <span>Create Your Free Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ebebeb] bg-[#fafafa] py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700 lowercase">simple do</span>
            <span>•</span>
            <span>Minimalist Cloud Workspace for Humans &amp; Agents</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => scrollToAuth('signup')}
              className="hover:text-neutral-900 transition-colors"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => scrollToAuth('signin')}
              className="hover:text-neutral-900 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={handleConnectLegacy}
              className="font-mono hover:text-neutral-900 transition-colors"
            >
              Root DB (/simpledo_data)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
