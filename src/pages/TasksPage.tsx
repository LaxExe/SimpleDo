import React, { useState } from 'react';
import { Task, InboxGroup, Priority } from '../types';
import { storage, getTodayStr } from '../services/storage';
import { TaskProgressBar } from '../components/TaskProgressBar';
import { TaskEditModal } from '../components/TaskEditModal';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Sun, 
  Edit2,
  Check,
  ArrowUpDown
} from 'lucide-react';

interface TasksPageProps {
  tasks: Task[];
  inboxes: InboxGroup[];
}

export const TasksPage: React.FC<TasksPageProps> = ({ tasks, inboxes }) => {
  // Show active tasks only by default
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'high'>('active');
  const [sortBy, setSortBy] = useState<'priority' | 'due_date' | 'inbox' | 'newest'>('inbox');
  const [title, setTitle] = useState('');
  const [inboxId, setInboxId] = useState(inboxes[0]?.id || 'inbox-general');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = getTodayStr();
  const todayPlan = storage.getDayPlan(todayStr);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedInbox = inboxes.find((i) => i.id === inboxId);

    storage.addTask({
      title: title.trim(),
      completed: false,
      priority,
      inboxId,
      category: selectedInbox?.name || 'General',
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setIsAdding(false);
  };

  const isPlannedForToday = (task: Task) => {
    return (
      task.scheduledDate === todayStr ||
      Boolean(todayPlan?.plannedTaskIds && todayPlan.plannedTaskIds.includes(task.id))
    );
  };

  const handleToggleToday = (taskId: string, isCurrentlyPlanned: boolean) => {
    if (isCurrentlyPlanned) {
      storage.removeTaskFromDate(todayStr, taskId);
    } else {
      storage.addTaskToDate(todayStr, taskId);
    }
  };

  const rawFilteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'high') return t.priority === 'high' && !t.completed;
    return true;
  });

  // Prioritize active tasks first, then apply sortBy
  const filteredTasks = [...rawFilteredTasks].sort((a, b) => {
    // 1. Active before completed
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (sortBy === 'due_date') {
      // Most recently / earliest due date first
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortBy === 'inbox') {
      const inboxA = inboxes.find((i) => i.id === a.inboxId)?.name || 'General';
      const inboxB = inboxes.find((i) => i.id === b.inboxId)?.name || 'General';
      const cmp = inboxA.localeCompare(inboxB);
      if (cmp !== 0) return cmp;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    // Default: 'priority' (High -> Medium -> Low)
    const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
    const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Group tasks by inbox when sortBy === 'inbox'
  const inboxGroupsWithTasks = inboxes
    .map((inbox) => ({
      inbox,
      tasks: filteredTasks.filter((t) => (t.inboxId || 'inbox-general') === inbox.id),
    }))
    .filter((g) => g.tasks.length > 0);

  const unassignedTasks = filteredTasks.filter(
    (t) => !inboxes.some((i) => i.id === (t.inboxId || 'inbox-general'))
  );
  if (unassignedTasks.length > 0) {
    inboxGroupsWithTasks.push({
      inbox: {
        id: 'inbox-other',
        name: 'Other',
        color: '#737373',
        createdAt: new Date().toISOString(),
      },
      tasks: unassignedTasks,
    });
  }

  const renderTaskItem = (task: Task, showInboxBadge: boolean = true) => {
    const inboxInfo = inboxes.find((i) => i.id === task.inboxId);
    const plannedToday = isPlannedForToday(task);
    const inboxColor = inboxInfo?.color || '#171717';

    return (
      <li
        key={task.id}
        className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors group"
        style={{
          borderLeft: `3.5px solid ${inboxColor}`,
        }}
      >
        {/* Left: Checkbox + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => storage.toggleTask(task.id)}
            className="flex-shrink-0 transition-transform active:scale-95"
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-neutral-900 fill-neutral-200" />
            ) : (
              <Circle className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500" />
            )}
          </button>

          <div className="min-w-0">
            <p
              onClick={() => storage.cycleTaskProgress(task.id)}
              className={`text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${
                task.completed
                  ? 'line-through text-neutral-400'
                  : 'text-neutral-900'
              }`}
            >
              {task.title}
            </p>
            <div className="mt-1">
              <TaskProgressBar
                taskId={task.id}
                hasProgress={task.hasProgress}
                completedParts={task.completedParts}
                totalParts={task.totalParts || 4}
                completed={task.completed}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Right: Badges & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Priority Tag */}
          {task.priority === 'high' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-200/50">
              High
            </span>
          )}
          {task.priority === 'medium' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200/50">
              Med
            </span>
          )}

          {/* Inbox Tag (shown in flat view with matching color dot, visible on mobile) */}
          {showInboxBadge && inboxInfo && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-700 bg-white border border-[#ebebeb] px-2 py-0.5 rounded shadow-2xs">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: inboxColor }}
              />
              <span className="truncate max-w-[85px] sm:max-w-none">{inboxInfo.name}</span>
            </span>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          )}

          {/* Today Button */}
          <button
            onClick={() => handleToggleToday(task.id, plannedToday)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
              plannedToday
                ? 'bg-green-50 text-green-700 border border-green-200/80 shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent'
            }`}
            title={plannedToday ? 'Planned for Today (click to remove)' : 'Add to Today'}
          >
            {plannedToday ? (
              <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span>Today</span>
          </button>

          {/* Edit Task Button */}
          <button
            onClick={() => setEditingTask(task)}
            className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
            title="Edit task details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => storage.deleteTask(task.id)}
            className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Tasks
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Close Form' : 'Add Task'}</span>
          </button>
        </div>
      </div>

      {/* Inline Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="bg-white p-4 rounded-lg border border-[#ebebeb] shadow-subtle space-y-3"
        >
          <div className="text-xs font-semibold text-neutral-900">Create New Task</div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Inbox:</span>
              <select
                value={inboxId}
                onChange={(e) => setInboxId(e.target.value)}
                className="text-xs bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-1 focus:outline-none"
              >
                {inboxes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Priority:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="text-xs bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-1 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Due:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-1 focus:outline-none"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-3.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50"
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filters, Sort, and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-[#ebebeb]/50 p-1 rounded-full border border-[#ebebeb] overflow-x-auto no-scrollbar">
            {(['all', 'active', 'completed', 'high'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-all ${
                  filter === mode
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-1.5 bg-white border border-[#ebebeb] px-2.5 py-1 rounded-full shadow-2xs text-xs">
            <ArrowUpDown className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-400 font-mono text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-900 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
              <option value="inbox">Inbox</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
          <span>{pendingCount} active</span>
          <span>•</span>
          <span>{completedCount} completed</span>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle py-12 text-center text-xs text-neutral-400">
          No tasks found
        </div>
      ) : sortBy === 'inbox' ? (
        <div className="space-y-4">
          {inboxGroupsWithTasks.map(({ inbox, tasks: groupTasks }) => (
            <div
              key={inbox.id}
              className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle overflow-hidden"
            >
              {/* Colored Region Header */}
              <div
                className="px-4 py-3 sm:px-5 flex items-center justify-between border-b border-[#ebebeb]"
                style={{
                  backgroundColor: `${inbox.color || '#171717'}12`,
                  borderLeft: `4px solid ${inbox.color || '#171717'}`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs"
                    style={{ backgroundColor: inbox.color || '#171717' }}
                  />
                  <h2 className="text-xs sm:text-sm font-semibold text-neutral-900 tracking-tight">
                    {inbox.name}
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-white border border-[#ebebeb] text-neutral-700 shadow-2xs">
                  {groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Task list for this inbox */}
              <ul className="divide-y divide-[#ebebeb]/70">
                {groupTasks.map((task) => renderTaskItem(task, false))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle overflow-hidden">
          <ul className="divide-y divide-[#ebebeb]/70">
            {filteredTasks.map((task) => renderTaskItem(task, true))}
          </ul>
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        inboxes={inboxes}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
};
