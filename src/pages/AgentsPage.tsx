import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Page } from '../types';

interface AgentsPageProps {
  onNavigate: (page: Page) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'api' | 'recipes' | 'raw'>('guide');

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
  inboxId: 'inbox-work',
  scheduledDate: today
});

// 2. Schedule a meeting event
window.storage.addEvent({
  title: 'Architecture Sync',
  date: today,
  time: '3:00 PM',
  location: 'Google Meet',
  inboxId: 'inbox-work'
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
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
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
              v4.0 Protocol
            </span>
          </div>
          <p className="text-xs text-neutral-500 pl-8">
            Complete instructions and operational specification for AI agents manipulating SimpleDo.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pl-8 sm:pl-0">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 rounded-md transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Instructions' : 'Copy Instructions'}</span>
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

      {/* Navigation Pills */}
      <div className="flex items-center gap-1.5 border-b border-[#ebebeb] pb-3 text-xs font-mono overflow-x-auto no-scrollbar">
        {[
          { id: 'guide', label: '📖 Overview & Logic', icon: Workflow },
          { id: 'api', label: '⚡ storage API Reference', icon: Database },
          { id: 'recipes', label: '🤖 Agent Code Recipes', icon: Code2 },
          { id: 'raw', label: '📄 Raw Markdown Document', icon: Terminal },
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

      {/* Tab 1: Overview & Page Logic */}
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

      {/* Tab 2: Storage API Reference */}
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

      {/* Tab 3: Agent Code Recipes */}
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
  title: 'Write project documentation',
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

      {/* Tab 4: Raw Markdown Text */}
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
