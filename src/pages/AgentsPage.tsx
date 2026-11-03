import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Copy, 
  Check, 
  ArrowLeft, 
  Terminal, 
  Layers, 
  Database, 
  Workflow, 
  Code2, 
  Sparkles,
  Save,
  RotateCw,
  FileDown,
  Upload,
  AlertCircle,
  CheckCircle2,
  Play
} from 'lucide-react';
import { Page, SimpleDoData } from '../types';
import { storage } from '../services/storage';

interface AgentsPageProps {
  onNavigate: (page: Page) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'database' | 'guide' | 'api' | 'recipes' | 'raw'>('database');

  // Live Database Editor State
  const [dbText, setDbText] = useState<string>('');
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbSuccess, setDbSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState({
    tasks: 0,
    activeTasks: 0,
    inboxes: 0,
    events: 0,
    habits: 0,
    dayPlans: 0
  });

  // Interactive JavaScript Evaluator
  const [evalCode, setEvalCode] = useState<string>('window.storage.load()');
  const [evalResult, setEvalResult] = useState<string | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Load current database into textarea
  const refreshFromStorage = () => {
    try {
      const data = storage.load();
      setDbText(JSON.stringify(data, null, 2));
      setStats({
        tasks: data.tasks.length,
        activeTasks: data.tasks.filter((t) => !t.completed).length,
        inboxes: data.inboxes.length,
        events: (data.events || []).length,
        habits: data.habits.length,
        dayPlans: Object.keys(data.dayPlans || {}).length,
      });
      setDbError(null);
    } catch (e: any) {
      setDbError(`Failed to load database: ${e.message}`);
    }
  };

  useEffect(() => {
    refreshFromStorage();

    // Listen to changes from other tabs or actions
    const handleStorageChange = () => {
      // Update stats without overwriting dirty editor text
      try {
        const data = storage.load();
        setStats({
          tasks: data.tasks.length,
          activeTasks: data.tasks.filter((t) => !t.completed).length,
          inboxes: data.inboxes.length,
          events: (data.events || []).length,
          habits: data.habits.length,
          dayPlans: Object.keys(data.dayPlans || {}).length,
        });
      } catch (_) {}
    };

    window.addEventListener('simpledo:change', handleStorageChange);
    return () => window.removeEventListener('simpledo:change', handleStorageChange);
  }, []);

  // Save changes from textarea to localStorage
  const handleSaveDb = () => {
    try {
      const parsed: SimpleDoData = JSON.parse(dbText);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Database root must be a valid JSON object');
      }
      if (!Array.isArray(parsed.tasks)) parsed.tasks = [];
      if (!Array.isArray(parsed.inboxes)) parsed.inboxes = [];
      if (!Array.isArray(parsed.events)) parsed.events = [];
      if (!Array.isArray(parsed.habits)) parsed.habits = [];
      if (typeof parsed.dayPlans !== 'object' || parsed.dayPlans === null) parsed.dayPlans = {};

      storage.save(parsed);
      setDbError(null);
      setDbSuccess(
        `Database updated successfully! Saved ${parsed.tasks.length} tasks, ${parsed.inboxes.length} inboxes, ${(parsed.events || []).length} events.`
      );
      setStats({
        tasks: parsed.tasks.length,
        activeTasks: parsed.tasks.filter((t) => !t.completed).length,
        inboxes: parsed.inboxes.length,
        events: (parsed.events || []).length,
        habits: parsed.habits.length,
        dayPlans: Object.keys(parsed.dayPlans || {}).length,
      });
      setTimeout(() => setDbSuccess(null), 4000);
    } catch (err: any) {
      setDbError(`Invalid JSON: ${err.message}`);
      setDbSuccess(null);
    }
  };

  // Format JSON indentation
  const handleFormatDb = () => {
    try {
      const parsed = JSON.parse(dbText);
      setDbText(JSON.stringify(parsed, null, 2));
      setDbError(null);
    } catch (err: any) {
      setDbError(`Cannot format: ${err.message}`);
    }
  };

  // Copy DB JSON
  const handleCopyDb = () => {
    navigator.clipboard.writeText(dbText);
    setDbSuccess('Database JSON copied to clipboard!');
    setTimeout(() => setDbSuccess(null), 2500);
  };

  // Download DB as JSON file
  const handleDownloadDb = () => {
    const blob = new Blob([dbText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simpledo_db_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Upload/Import DB JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setDbText(JSON.stringify(parsed, null, 2));
        setDbError(null);
        setDbSuccess(`File "${file.name}" loaded into editor. Click "Save & Apply Database" to persist.`);
      } catch (err: any) {
        setDbError(`Failed to parse uploaded file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Reset to clean template
  const handleResetToClean = () => {
    if (confirm('Replace editor content with an empty database template? You must click "Save & Apply Database" to commit.')) {
      const emptyDb: SimpleDoData = {
        tasks: [],
        events: [],
        inboxes: [
          {
            id: 'inbox-general',
            name: 'General',
            description: 'Default Inbox',
            color: '#171717',
            createdAt: new Date().toISOString(),
          },
        ],
        habits: [],
        dayPlans: {},
      };
      setDbText(JSON.stringify(emptyDb, null, 2));
      setDbError(null);
      setDbSuccess('Clean template loaded. Click "Save & Apply Database" to persist.');
    }
  };

  // Run interactive JavaScript
  const handleRunEval = () => {
    try {
      setEvalError(null);
      // Execute in browser context with storage in scope
      const fn = new Function('storage', `return (${evalCode});`);
      const result = fn(storage);
      setEvalResult(
        typeof result === 'object' && result !== null
          ? JSON.stringify(result, null, 2)
          : String(result)
      );
    } catch (err: any) {
      setEvalError(err.message || 'Execution error');
      setEvalResult(null);
    }
  };

  const rawInstructionsText = `# SimpleDo — Autonomous Agent Operational Manual & API Protocol

> Application: SimpleDo
> Runtime: Browser Client (Local-First, React 18, Vite, Tailwind CSS)
> Primary Storage Key: 'simpledo_data_v4' in localStorage
> Global Window API: window.storage
> Change Event: 'simpledo:change' dispatched on window

---

## 1. System Overview & Core Philosophy
SimpleDo is an ultra-minimalist, local-first daily execution and task planning engine.
- Zero External Backend: All data persists client-side in localStorage ('simpledo_data_v4').
- Immediate Reactivity: Every storage mutation broadcasts 'simpledo:change' on window, re-rendering active components automatically.
- Global Console Access: window.storage is exposed globally for headless agents, browser automation tools, and dev scripts.
- Design Language: Strict monochrome typography, high contrast, clean borders, lowercase brand "simple do", fractions for progress (no percentage symbols).

---

## 2. Core Data Models & Schemas

### Task
\`\`\`typescript
interface Task {
  id: string;              // Unique ID, e.g. "task-1730598123-abc"
  title: string;           // Title text
  completed: boolean;      // True if finished (moved to archive)
  priority: 'low' | 'medium' | 'high';
  category?: string;       // Optional category label
  inboxId?: string;        // ID of assigned InboxGroup (defaults to general inbox)
  dueDate?: string;        // Optional YYYY-MM-DD due date
  scheduledDate?: string;  // Optional YYYY-MM-DD planned date in Day Planner
  hasProgress?: boolean;   // False on creation. True once progress is activated
  totalParts?: number;     // Total parts (default: 4)
  completedParts?: number; // Integer between 0 and totalParts
  createdAt: string;       // ISO 8601 timestamp
}
\`\`\`

### InboxGroup
\`\`\`typescript
interface InboxGroup {
  id: string;          // Unique ID, e.g. "inbox-general", "inbox-work"
  name: string;        // Display name
  description?: string;
  color?: string;      // Hex color, e.g. "#171717", "#0068d6", "#10b981"
  createdAt: string;   // ISO 8601 timestamp
}
\`\`\`

### InboxEvent (Calendar Entries)
\`\`\`typescript
interface InboxEvent {
  id: string;          // Unique ID, e.g. "evt-1730598123-xyz"
  title: string;       // Event title
  inboxId?: string;    // Links event to an inbox
  date: string;        // YYYY-MM-DD
  time?: string;       // e.g. "10:00 AM" or "14:30"
  location?: string;   // e.g. "Zoom", "Office Room 3"
  description?: string;
  completed?: boolean; // True if archived
  createdAt: string;   // ISO 8601 timestamp
}
\`\`\`

### Habit
\`\`\`typescript
interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekdays';
  completedDates: string[]; // Array of YYYY-MM-DD strings
  streak: number;
  bestStreak: number;
  createdAt: string;
}
\`\`\`

### DayPlan
\`\`\`typescript
interface DayPlan {
  date: string;              // YYYY-MM-DD
  notes?: string;
  plannedTaskIds: string[];  // Task IDs assigned to this day
  plannedHabitIds: string[]; // Habit IDs assigned to this day
}
\`\`\`

---

## 3. Storage API Reference (window.storage)

### Tasks
- storage.load(): SimpleDoData
  Returns the complete current data state.
- storage.save(data: SimpleDoData): void
  Persists state and fires 'simpledo:change'.
- storage.addTask(task: Omit<Task, 'id' | 'createdAt'>): Task
  Creates a task. hasProgress is false by default. If scheduledDate is supplied, automatically registers in dayPlans.
- storage.updateTask(id: string, updates: Partial<Task>): void
  Updates fields on an existing task.
- storage.toggleTask(id: string): void
  Toggles task completion. Completed tasks immediately move to the inbox Archive.
- storage.deleteTask(id: string): void
  Permanently removes task from storage and all day plans.
- storage.setTaskProgress(id: string, parts: number): void
  Sets hasProgress: true and updates completedParts (0 to 4).
  CRITICAL: Setting 4/4 does NOT auto-complete the task. The user or agent must explicitly call toggleTask(id) or click the circle to confirm completion.

### Inboxes
- storage.addInbox({ name, color, description }): InboxGroup
  Creates a new inbox bucket.
- storage.updateInbox(id: string, updates: Partial<InboxGroup>): void
- storage.deleteInbox(id: string): void
  Deletes inbox and reassigns its tasks to general.
- storage.reorderInboxes(inboxes: InboxGroup[]): void
  Updates inbox display order.

### Events
- storage.addEvent({ title, date, time, location, inboxId }): InboxEvent
  Creates a calendar event.
- storage.updateEvent(id: string, updates: Partial<InboxEvent>): void
- storage.toggleEvent(id: string): void
  Toggles event completion into archive.
- storage.deleteEvent(id: string): void

### Habits & Streaks
- storage.addHabit({ name, category, frequency }): Habit
- storage.toggleHabitDate(id: string, date: string): void
  Toggles habit completion on date and recalculates streaks.
- storage.deleteHabit(id: string): void

### Day Planner & Calendar Scheduling
- storage.getDayPlan(date: string): DayPlan
- storage.addTaskToDate(date: string, taskId: string): void
  Adds task to day's planned pool and sets scheduledDate.
- storage.removeTaskFromDate(date: string, taskId: string): void
  Removes task from day's planned pool, resets scheduledDate, and clears dueDate if matching.
- storage.addHabitToDate(date: string, habitId: string): void
- storage.removeHabitFromDate(date: string, habitId: string): void
- storage.moveTaskToDate(taskId: string, targetDate: string, sourceDate?: string): void
  Moves task to a new target date (e.g. tomorrow).
- storage.resetAll(): void
  Clears all tasks, events, habits, inboxes, and day plans.

---

## 4. Page Logic & Operational Workflows

### 1. Today Page (Route / Page ID: 'today')
- Top Date Switcher:
  Allows navigating between past, present, and future dates.
- Active Tasks List:
  - Displays tasks that are scheduled for this date or due on this date.
  - Active Only: Completed tasks are never displayed here; they immediately enter the inbox archive.
  - Full Color Due Highlight: If task.dueDate === selectedDate, the ENTIRE card is filled with the inbox's color with white text and icons. Non-due tasks display a 4px left border matching inbox color.
  - Circle Checkbox: Confirms completion and archives the task.
  - Title Click: Enables 4-part progress tracker (0/4) if not active, or increments parts (1/4 -> 2/4 -> 3/4 -> 4/4 -> 0/4).
  - Effortless Remove (X): Invokes removeTaskFromDate to detach the task from the day without deleting it.
  - Move to Tomorrow (-> Tomorrow): Moves task to next day.
- Events for Today:
  - Sits below tasks; fully colored in with inbox background color. Shows time and location.
- Habits for Today:
  - Only habits explicitly dragged or added to today are tracked. Clicking the circle marks it complete and updates streaks.
- Plan Section:
  - Quick Add Input: Creates a task scheduled for today WITHOUT a due date.
  - Available Shelf: Horizontally scrollable card track grouped by inbox with matching colors. Click "+ Add" or drag into day.
- Full Calendar Grid:
  - Full month view placed below Today.
  - Cells expand dynamically in height to display ALL tasks and events without truncation or hidden badges.
  - Due tasks and events are fully filled with inbox color.
  - Drag and drop tasks and habits onto any day.

### 2. Tasks Page (Route / Page ID: 'tasks')
- Complete list of active tasks with filter by inbox, search query, and priority.
- Inline task creation.
- Today toggle button (Sun / green checkmark) to add or remove from today's plan.

### 3. Inbox Page (Route / Page ID: 'inbox')
- Inboxes list on left: create inbox, pick color, reorder up/down.
- Create Task or Create Event (events include time and location).
- Tasks list with progress trackers and Today toggles.
- Events list with completed toggle.
- Archive section: Collapsed by default, no counter of completed items. Shows completed tasks and events with restore / delete options.

### 4. Tracker Page (Route / Page ID: 'tracker')
- Habit streak management and visual completion grid.

---

## 5. Agent Automation Recipes (JavaScript / Console)

\`\`\`javascript
// 1. Add a planned task for today (no due date)
const today = new Date().toISOString().split('T')[0];
window.storage.addTask({
  title: 'Review pull requests',
  priority: 'high',
  inboxId: 'inbox-general',
  scheduledDate: today
});

// 2. Schedule a meeting event
window.storage.addEvent({
  title: 'Weekly Sprint Retrospective',
  date: today,
  time: '2:00 PM',
  location: 'Google Meet',
  inboxId: 'inbox-general'
});

// 3. Set progress on a task to 3/4
window.storage.setTaskProgress('task-id-here', 3);

// 4. Confirm completion of a task
window.storage.toggleTask('task-id-here');

// 5. Query and format today's active schedule
const data = window.storage.load();
const plan = data.dayPlans[today] || { plannedTaskIds: [], plannedHabitIds: [] };
const activeTodayTasks = data.tasks.filter(t => !t.completed && (plan.plannedTaskIds.includes(t.id) || t.scheduledDate === today || t.dueDate === today));
const activeTodayEvents = data.events.filter(e => !e.completed && e.date === today);
console.log({ activeTodayTasks, activeTodayEvents });
\`\`\`
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawInstructionsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawInstructionsText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AGENTS.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ebebeb]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('today')}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              title="Return to Today"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-neutral-900" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
                .Agents
              </h1>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-white font-medium">
              Live Database & Agent Hub
            </span>
          </div>
          <p className="text-xs text-neutral-500 pl-8">
            Directly view and edit the live database, run commands, and review operational instructions for autonomous agents.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pl-8 sm:pl-0">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 rounded-md transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Manual' : 'Copy Manual'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-neutral-700 hover:text-neutral-900 border border-[#ebebeb] hover:bg-neutral-50 rounded-md transition-colors shadow-2xs"
            title="Download AGENTS.md"
          >
            <Terminal className="w-3.5 h-3.5 text-neutral-500" />
            <span>AGENTS.md</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#ebebeb] pb-3 text-xs font-mono overflow-x-auto no-scrollbar">
        {[
          { id: 'database', label: '🗄️ Live Database Editor', icon: Database },
          { id: 'guide', label: '📖 Overview & Logic', icon: Workflow },
          { id: 'api', label: '⚡ storage API Reference', icon: Database },
          { id: 'recipes', label: '🤖 Code Recipes & Console', icon: Code2 },
          { id: 'raw', label: '📄 Raw AGENTS.md', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white font-medium shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE EDITABLE DATABASE (DIRECT LINK & TEXTBOX) */}
      {/* ======================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Live DB Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Tasks</span>
              <span className="text-base font-bold text-neutral-900 font-mono">
                {stats.tasks} <span className="text-xs font-normal text-neutral-400">({stats.activeTasks} active)</span>
              </span>
            </div>
            <div className="p-3 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Inboxes</span>
              <span className="text-base font-bold text-neutral-900 font-mono">{stats.inboxes}</span>
            </div>
            <div className="p-3 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Events</span>
              <span className="text-base font-bold text-neutral-900 font-mono">{stats.events}</span>
            </div>
            <div className="p-3 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Habits</span>
              <span className="text-base font-bold text-neutral-900 font-mono">{stats.habits}</span>
            </div>
            <div className="p-3 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Day Plans</span>
              <span className="text-base font-bold text-neutral-900 font-mono">{stats.dayPlans}</span>
            </div>
            <div className="p-3 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Storage Key</span>
              <span className="text-xs font-mono text-neutral-700 font-medium truncate block" title="simpledo_data_v4">
                v4 (localStorage)
              </span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {dbSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{dbSuccess}</span>
            </div>
          )}

          {dbError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{dbError}</span>
            </div>
          )}

          {/* Editor Header & Actions */}
          <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle overflow-hidden">
            <div className="p-3 sm:px-4 bg-[#fafafa] border-b border-[#ebebeb] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-neutral-900" />
                <span className="font-semibold text-neutral-900">Database JSON Editor</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                  Live Read & Write
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleFormatDb}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded text-neutral-700 transition-colors"
                  title="Format JSON with 2-space indentation"
                >
                  Format
                </button>
                <button
                  type="button"
                  onClick={refreshFromStorage}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded text-neutral-700 transition-colors inline-flex items-center gap-1"
                  title="Reload current state from localStorage"
                >
                  <RotateCw className="w-3 h-3 text-neutral-500" />
                  <span>Reload</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyDb}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded text-neutral-700 transition-colors inline-flex items-center gap-1"
                  title="Copy full JSON to clipboard"
                >
                  <Copy className="w-3 h-3 text-neutral-500" />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDb}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded text-neutral-700 transition-colors inline-flex items-center gap-1"
                  title="Download database file"
                >
                  <FileDown className="w-3 h-3 text-neutral-500" />
                  <span>Export</span>
                </button>
                <label className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded text-neutral-700 transition-colors inline-flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3 h-3 text-neutral-500" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSaveDb}
                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded transition-colors inline-flex items-center gap-1 shadow-2xs"
                  title="Validate and save changes to localStorage"
                >
                  <Save className="w-3 h-3 text-white" />
                  <span>Save & Apply Database</span>
                </button>
              </div>
            </div>

            {/* Editable Textbox */}
            <div className="relative">
              <textarea
                value={dbText}
                onChange={(e) => {
                  setDbText(e.target.value);
                  setDbError(null);
                }}
                rows={22}
                spellCheck={false}
                placeholder="Database JSON..."
                className="w-full p-4 font-mono text-xs text-neutral-900 bg-white focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Bottom Footer Information */}
            <div className="p-3 bg-[#fafafa] border-t border-[#ebebeb] flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>
                Tip for Agents: Paste complete JSON here and click <strong>"Save & Apply Database"</strong>. All components update instantly.
              </span>
              <button
                type="button"
                onClick={handleResetToClean}
                className="text-neutral-400 hover:text-red-600 transition-colors ml-4"
                title="Load empty database template"
              >
                Reset Template
              </button>
            </div>
          </div>

          {/* Interactive Agent Command Evaluator */}
          <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#ebebeb]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-neutral-900" />
                <span className="font-semibold text-neutral-900">Agent Command Runner</span>
                <span className="text-neutral-400 font-normal">Evaluate JavaScript expressions with storage in scope</span>
              </div>
              <button
                type="button"
                onClick={handleRunEval}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Run</span>
              </button>
            </div>

            <input
              type="text"
              value={evalCode}
              onChange={(e) => setEvalCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunEval();
              }}
              placeholder="e.g. storage.addTask({ title: 'Agent Created Task', scheduledDate: '2026-11-02' })"
              className="w-full px-3 py-2 bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 text-neutral-900 text-xs font-mono"
            />

            {evalError && (
              <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded text-[11px]">
                Error: {evalError}
              </div>
            )}

            {evalResult && (
              <pre className="p-3 bg-[#fafafa] border border-[#ebebeb] rounded max-h-48 overflow-y-auto text-neutral-800 text-[11px] leading-relaxed">
                {evalResult}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: OVERVIEW & PAGE LOGIC */}
      {/* ======================================================== */}
      {activeTab === 'guide' && (
        <div className="space-y-8 text-neutral-800 text-sm leading-relaxed">
          {/* Quick Core Rules Box */}
          <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3">
            <h2 className="text-xs font-mono font-semibold uppercase text-neutral-900 flex items-center gap-1.5 tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
              <span>Core Application Rules for Autonomous Agents</span>
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-neutral-600">
              <li className="p-2.5 bg-[#fafafa] rounded-lg border border-[#ebebeb]">
                <strong className="text-neutral-900 block mb-0.5">1. Local-First & Reactive:</strong>
                All data is in localStorage ('simpledo_data_v4'). Call window.storage directly. React components update automatically on 'simpledo:change'.
              </li>
              <li className="p-2.5 bg-[#fafafa] rounded-lg border border-[#ebebeb]">
                <strong className="text-neutral-900 block mb-0.5">2. Manual Completion Confirmation:</strong>
                Reaching 4/4 progress segments does NOT complete a task. The circle checkbox must be clicked or storage.toggleTask() called to confirm completion.
              </li>
              <li className="p-2.5 bg-[#fafafa] rounded-lg border border-[#ebebeb]">
                <strong className="text-neutral-900 block mb-0.5">3. Full Inbox Color on Due Date:</strong>
                Tasks due on the selected date are filled FULLY with their inbox background color and white text. Non-due tasks display a 4px left border.
              </li>
              <li className="p-2.5 bg-[#fafafa] rounded-lg border border-[#ebebeb]">
                <strong className="text-neutral-900 block mb-0.5">4. Plan Mode Tasks Have No Due Date:</strong>
                Tasks created via the Plan input on the Today page are scheduled for that day without an automatic due date, ensuring effortless removal.
              </li>
              <li className="p-2.5 bg-[#fafafa] rounded-lg border border-[#ebebeb]">
                <strong className="text-neutral-900 block mb-0.5">5. Completed Tasks Vanish to Archive:</strong>
                The Today list and default views show active tasks only. Completed tasks move to their inbox's collapsed Archive section.
              </li>
              <li className="p-2.5 bg-[#fafafa] rounded-lg border border-[#ebebeb]">
                <strong className="text-neutral-900 block mb-0.5">6. Expanding Full Calendar:</strong>
                Calendar day cells expand and stretch naturally to render every task and event. Events and due tasks are fully filled with inbox color.
              </li>
            </ul>
          </div>

          {/* Detailed Page Breakdown */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-900" />
              <span>Pages & Operational Logic</span>
            </h2>

            {/* Today Page */}
            <div className="p-5 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3">
              <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-900" />
                  <span>Today Page ('today')</span>
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">Main Daily Driver</span>
              </div>
              <p className="text-xs text-neutral-600">
                The primary execution dashboard for the user. It integrates active tasks, events, habits, planning shelf, and month calendar into a single focused flow.
              </p>
              <div className="space-y-2 text-xs text-neutral-700">
                <div>
                  <strong className="text-neutral-900">Task Display:</strong> Displays active (uncompleted) tasks where scheduledDate === selectedDate or dueDate === selectedDate. Completed tasks disappear into archive immediately upon completion.
                </div>
                <div>
                  <strong className="text-neutral-900">Due Date Highlight:</strong> If task.dueDate === selectedDate, the entire task card is filled with the inbox background color (white text, white action buttons).
                </div>
                <div>
                  <strong className="text-neutral-900">Progress Activation:</strong> Newly added tasks show no progress bar. Clicking the task title activates the 4-part bar (0/4). Further clicks advance progress (1/4, 2/4, 3/4, 4/4, 0/4).
                </div>
                <div>
                  <strong className="text-neutral-900">Task Actions:</strong> Clicking circle completes task. "→ Tomorrow" moves task to next date. "Remove" (X) cleanly detaches task from day.
                </div>
                <div>
                  <strong className="text-neutral-900">Events Section:</strong> Sits below tasks; fully colored in with inbox background color. Cannot be planned into task mode.
                </div>
                <div>
                  <strong className="text-neutral-900">Plan Section & Shelf:</strong> Quick input plans a task for today with no due date. The horizontal card shelf groups available tasks by inbox with scroll arrows. Click "+ Add" or drag.
                </div>
                <div>
                  <strong className="text-neutral-900">Month Calendar:</strong> Displays below Today section. Grid dynamically expands vertically so all scheduled tasks and events are fully shown.
                </div>
              </div>
            </div>

            {/* Tasks Page */}
            <div className="p-5 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3">
              <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-900" />
                  <span>Tasks Page ('tasks')</span>
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">Task Database</span>
              </div>
              <p className="text-xs text-neutral-600">
                Database of all user tasks. Active tasks shown by default. Search bar, priority filters, inbox filters, and 1-click Today toggle buttons.
              </p>
            </div>

            {/* Inbox Page */}
            <div className="p-5 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3">
              <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-900" />
                  <span>Inbox Page ('inbox')</span>
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">Categorization & Calendar Events</span>
              </div>
              <p className="text-xs text-neutral-600">
                Manage colored inboxes, reorder inboxes up/down, create tasks, create calendar events (with time and location), and view the collapsed Archive section.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STORAGE API REFERENCE */}
      {/* ======================================================== */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="p-4 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-xs space-y-2">
            <div className="text-neutral-400 font-semibold">// Global Window Availability</div>
            <div>window.storage: StorageAPI</div>
            <div className="text-neutral-400 pt-1">// Any mutation calls storage.save() and dispatches:</div>
            <div className="text-emerald-400">window.dispatchEvent(new CustomEvent('simpledo:change'))</div>
          </div>

          <div className="grid grid-cols-1 gap-4 font-mono text-xs">
            {/* Task Methods */}
            <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-2">
              <h3 className="font-bold text-neutral-900 text-sm">storage.addTask(task)</h3>
              <p className="text-neutral-600 font-sans">
                Creates a new task. Sets <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">hasProgress: false</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">completedParts: 0</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">totalParts: 4</code>. If scheduledDate is provided, automatically adds to dayPlans.
              </p>
              <pre className="p-2.5 bg-[#fafafa] border border-[#ebebeb] rounded text-neutral-800 overflow-x-auto">
{`storage.addTask({
  title: string,
  priority: 'low' | 'medium' | 'high',
  inboxId?: string,
  scheduledDate?: string, // YYYY-MM-DD
  dueDate?: string        // YYYY-MM-DD
}) => Task`}
              </pre>
            </div>

            {/* Set Progress */}
            <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-2">
              <h3 className="font-bold text-neutral-900 text-sm">storage.setTaskProgress(id, parts)</h3>
              <p className="text-neutral-600 font-sans">
                Activates progress (<code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">hasProgress: true</code>) and sets <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">completedParts</code> (0 to 4). DOES NOT auto-complete the task when reaching 4/4.
              </p>
              <pre className="p-2.5 bg-[#fafafa] border border-[#ebebeb] rounded text-neutral-800 overflow-x-auto">
{`storage.setTaskProgress(taskId: string, parts: number) => void`}
              </pre>
            </div>

            {/* Toggle Task */}
            <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-2">
              <h3 className="font-bold text-neutral-900 text-sm">storage.toggleTask(id)</h3>
              <p className="text-neutral-600 font-sans">
                Toggles task completion status. When completed is true, the task vanishes from the active Today and task lists and enters the inbox Archive.
              </p>
              <pre className="p-2.5 bg-[#fafafa] border border-[#ebebeb] rounded text-neutral-800 overflow-x-auto">
{`storage.toggleTask(taskId: string) => void`}
              </pre>
            </div>

            {/* Remove Task From Date */}
            <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-2">
              <h3 className="font-bold text-neutral-900 text-sm">storage.removeTaskFromDate(date, taskId)</h3>
              <p className="text-neutral-600 font-sans">
                Removes the task from the specified date's plan, sets scheduledDate to undefined, and resets dueDate if it matched the date, ensuring clean removal.
              </p>
              <pre className="p-2.5 bg-[#fafafa] border border-[#ebebeb] rounded text-neutral-800 overflow-x-auto">
{`storage.removeTaskFromDate(date: string, taskId: string) => void`}
              </pre>
            </div>

            {/* Add Event */}
            <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-2">
              <h3 className="font-bold text-neutral-900 text-sm">storage.addEvent(event)</h3>
              <p className="text-neutral-600 font-sans">
                Adds a calendar event with time and location into a specific inbox.
              </p>
              <pre className="p-2.5 bg-[#fafafa] border border-[#ebebeb] rounded text-neutral-800 overflow-x-auto">
{`storage.addEvent({
  title: string,
  date: string,      // YYYY-MM-DD
  time?: string,     // e.g. "10:30 AM"
  location?: string, // e.g. "Conference Room A"
  inboxId?: string
}) => InboxEvent`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CODE RECIPES */}
      {/* ======================================================== */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#ebebeb]">
              <span className="font-bold text-neutral-900">Recipe 1: Add a task planned for today</span>
              <span className="text-neutral-400">JavaScript / Puppeteer / Console</span>
            </div>
            <pre className="p-3 bg-[#fafafa] rounded border border-[#ebebeb] text-neutral-900 overflow-x-auto">
{`const today = new Date().toISOString().split('T')[0];
window.storage.addTask({
  title: 'Review pull requests',
  priority: 'high',
  inboxId: 'inbox-general',
  scheduledDate: today
});`}
            </pre>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#ebebeb]">
              <span className="font-bold text-neutral-900">Recipe 2: Create a calendar event</span>
              <span className="text-neutral-400">JavaScript / Puppeteer / Console</span>
            </div>
            <pre className="p-3 bg-[#fafafa] rounded border border-[#ebebeb] text-neutral-900 overflow-x-auto">
{`const today = new Date().toISOString().split('T')[0];
window.storage.addEvent({
  title: 'Weekly Sprint Retrospective',
  date: today,
  time: '2:00 PM',
  location: 'Google Meet',
  inboxId: 'inbox-general'
});`}
            </pre>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#ebebeb]">
              <span className="font-bold text-neutral-900">Recipe 3: Inspect today's active schedule</span>
              <span className="text-neutral-400">JavaScript / Puppeteer / Console</span>
            </div>
            <pre className="p-3 bg-[#fafafa] rounded border border-[#ebebeb] text-neutral-900 overflow-x-auto">
{`const today = new Date().toISOString().split('T')[0];
const data = window.storage.load();
const plan = data.dayPlans[today] || { plannedTaskIds: [], plannedHabitIds: [] };

const activeTasks = data.tasks.filter(t => 
  !t.completed && (plan.plannedTaskIds.includes(t.id) || t.scheduledDate === today || t.dueDate === today)
);
const activeEvents = (data.events || []).filter(e => !e.completed && e.date === today);

console.log('Today Schedule:', {
  tasks: activeTasks.map(t => ({ id: t.id, title: t.title, progress: \`\${t.completedParts || 0}/4\` })),
  events: activeEvents.map(e => ({ id: e.id, title: e.title, time: e.time, location: e.location }))
});`}
            </pre>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#ebebeb]">
              <span className="font-bold text-neutral-900">Recipe 4: Reset & clear all data</span>
              <span className="text-neutral-400">JavaScript / Puppeteer / Console</span>
            </div>
            <pre className="p-3 bg-[#fafafa] rounded border border-[#ebebeb] text-neutral-900 overflow-x-auto">
{`window.storage.resetAll();`}
            </pre>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: RAW MARKDOWN TEXT */}
      {/* ======================================================== */}
      {activeTab === 'raw' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>Raw Markdown Format (Directly feedable to LLMs & Autonomous Agents)</span>
            <button
              onClick={handleCopy}
              className="text-neutral-900 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={rawInstructionsText}
            rows={24}
            className="w-full p-4 font-mono text-xs text-neutral-800 bg-white border border-[#ebebeb] rounded-xl focus:outline-none shadow-subtle resize-y leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
