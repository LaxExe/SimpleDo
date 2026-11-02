import React, { useState, useRef } from 'react';
import { Task, InboxGroup, Priority } from '../types';
import { storage, getTodayStr, sortTasksByInbox } from '../services/storage';
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
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

interface TasksPageProps {
  tasks: Task[];
  inboxes: InboxGroup[];
}

export const TasksPage: React.FC<TasksPageProps> = ({ tasks, inboxes }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'high'>('all');
  const [title, setTitle] = useState('');
  const [inboxId, setInboxId] = useState(inboxes[0]?.id || 'inbox-general');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

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
    return task.scheduledDate === todayStr || todayPlan.plannedTaskIds.includes(task.id);
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

  // Sort by inbox: General first, other inboxes sorted by name matching their colors
  const { allOrderedTasks } = sortTasksByInbox(rawFilteredTasks, inboxes);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const hasStackedTasks = allOrderedTasks.length > 2;

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Tasks
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Organize, prioritize, and check off your to-dos.
          </p>
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
            className="w-full px-3 py-2 text-sm bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
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
                className="px-3.5 py-1 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors disabled:opacity-50"
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filters and Stats + Scroll Arrows */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1 bg-[#ebebeb]/50 p-1 rounded-full border border-[#ebebeb] w-fit">
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

        <div className="flex items-center gap-3">
          <div className="text-xs text-neutral-500 font-mono">
            <span>{pendingCount} active</span>
            <span className="mx-1.5">•</span>
            <span>{completedCount} completed</span>
          </div>

          {hasStackedTasks && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#ebebeb] shadow-2xs">
              <button
                onClick={handleScrollLeft}
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] rounded transition-colors"
                title="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleScrollRight}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors"
                title="Scroll right"
              >
                <span>Scroll</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks List - Sorted by Inbox with Matching Colors & Horizontal Scroll Deck */}
      {allOrderedTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle py-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-neutral-700">No tasks found</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filter === 'completed'
              ? 'Check off tasks to see them completed here.'
              : 'Click "Add Task" above to create one.'}
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x"
          style={{ scrollbarWidth: 'thin' }}
        >
          {allOrderedTasks.map(({ task, inbox, isGeneral }) => {
            const inboxColor = inbox?.color || '#0068d6';
            const plannedToday = isPlannedForToday(task);

            return (
              <div
                key={task.id}
                className={`w-[290px] sm:w-[330px] shrink-0 snap-start bg-white rounded-xl border shadow-subtle p-5 flex flex-col justify-between transition-all group ${
                  isGeneral
                    ? 'border-[#ebebeb] hover:border-neutral-400'
                    : 'border-l-4'
                }`}
                style={!isGeneral ? { borderLeftColor: inboxColor, borderColor: '#ebebeb' } : undefined}
              >
                <div className="space-y-3">
                  {/* Inbox Label matching inbox color */}
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border"
                      style={
                        isGeneral
                          ? { backgroundColor: '#f5f5f5', color: '#525252', borderColor: '#e5e5e5' }
                          : {
                              backgroundColor: `${inboxColor}12`,
                              color: inboxColor,
                              borderColor: `${inboxColor}30`,
                            }
                      }
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isGeneral ? '#737373' : inboxColor }}
                      />
                      <span>{inbox?.name || 'General Inbox'}</span>
                    </span>

                    {task.priority === 'high' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 font-medium border border-red-200/50">
                        High
                      </span>
                    )}
                  </div>

                  {/* Checkbox and Task Title */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => storage.toggleTask(task.id)}
                      className="mt-0.5 flex-shrink-0 transition-transform active:scale-95"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-neutral-900 fill-neutral-900/10" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-300 hover:text-neutral-700" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-base font-medium leading-snug break-words ${
                          task.completed
                            ? 'line-through text-neutral-400'
                            : 'text-neutral-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-mono mt-1">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Today Checkmark toggle, Edit, Delete */}
                <div className="mt-4 pt-3 border-t border-[#ebebeb] flex items-center justify-between">
                  <button
                    onClick={() => handleToggleToday(task.id, plannedToday)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-all ${
                      plannedToday
                        ? 'bg-green-50 text-green-700 border border-green-200/80 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent'
                    }`}
                    title={plannedToday ? 'Planned for Today (click to remove)' : 'Add to Today'}
                  >
                    {plannedToday ? (
                      <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>Today</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                      title="Edit task details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => storage.deleteTask(task.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
