import React, { useState } from 'react';
import { Task, InboxGroup, Priority } from '../types';
import { storage, getTodayStr } from '../services/storage';
import { 
  Inbox, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  FolderPlus,
  Layers,
  Sun
} from 'lucide-react';

interface InboxPageProps {
  tasks: Task[];
  inboxes: InboxGroup[];
}

export const InboxPage: React.FC<InboxPageProps> = ({ tasks, inboxes }) => {
  const [selectedInboxId, setSelectedInboxId] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isCreatingInbox, setIsCreatingInbox] = useState(false);
  const [newInboxName, setNewInboxName] = useState('');
  const [newInboxDesc, setNewInboxDesc] = useState('');

  const todayStr = getTodayStr();

  // Filter tasks based on selected inbox
  const filteredTasks = tasks.filter((t) => {
    if (selectedInboxId === 'all') return true;
    return (t.inboxId || 'inbox-general') === selectedInboxId;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetInboxId =
      selectedInboxId === 'all' ? (inboxes[0]?.id || 'inbox-general') : selectedInboxId;

    const targetInbox = inboxes.find((i) => i.id === targetInboxId);

    storage.addTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      inboxId: targetInboxId,
      category: targetInbox?.name || 'Inbox',
      dueDate: newTaskDueDate || undefined,
    });

    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const handleCreateInbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInboxName.trim()) return;

    const colors = ['#0068d6', '#0070f3', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created = storage.addInbox(newInboxName, newInboxDesc, randomColor);
    setSelectedInboxId(created.id);
    setNewInboxName('');
    setNewInboxDesc('');
    setIsCreatingInbox(false);
  };

  const handleScheduleForToday = (taskId: string) => {
    storage.addTaskToDate(todayStr, taskId);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Inbox Hub
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Central repository to manage inboxes and organize tasks before scheduling.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingInbox(!isCreatingInbox)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded-full transition-colors shadow-subtle self-start sm:self-auto"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>{isCreatingInbox ? 'Cancel' : 'New Inbox'}</span>
        </button>
      </div>

      {/* New Inbox Creation Modal/Form */}
      {isCreatingInbox && (
        <form
          onSubmit={handleCreateInbox}
          className="bg-white p-4 rounded-lg border border-[#ebebeb] shadow-subtle space-y-3"
        >
          <div className="text-xs font-semibold text-neutral-900">Create New Inbox Category</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newInboxName}
              onChange={(e) => setNewInboxName(e.target.value)}
              placeholder="Inbox name (e.g. Side Projects, Reading List...)"
              autoFocus
              className="px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
            />
            <input
              type="text"
              value={newInboxDesc}
              onChange={(e) => setNewInboxDesc(e.target.value)}
              placeholder="Description (optional)"
              className="px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingInbox(false)}
              className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newInboxName.trim()}
              className="px-3.5 py-1 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors disabled:opacity-40"
            >
              Save Inbox
            </button>
          </div>
        </form>
      )}

      {/* Main Layout: Inbox Tabs/Sidebar + Tasks under selected inbox */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inbox List (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 px-1 mb-2">
            Your Inboxes
          </div>

          <button
            onClick={() => setSelectedInboxId('all')}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all ${
              selectedInboxId === 'all'
                ? 'bg-neutral-900 text-white border-neutral-900 font-medium shadow-sm'
                : 'bg-white hover:bg-[#fafafa] text-neutral-800 border-[#ebebeb]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>All Inboxes</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                selectedInboxId === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {tasks.length}
            </span>
          </button>

          {inboxes.map((inbox) => {
            const inboxTasks = tasks.filter((t) => (t.inboxId || 'inbox-general') === inbox.id);
            const isSelected = selectedInboxId === inbox.id;
            return (
              <div
                key={inbox.id}
                onClick={() => setSelectedInboxId(inbox.id)}
                className={`group cursor-pointer flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 font-medium shadow-sm'
                    : 'bg-white hover:bg-[#fafafa] text-neutral-800 border-[#ebebeb]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: inbox.color || '#0068d6' }}
                  />
                  <div className="truncate">
                    <p className="truncate font-medium">{inbox.name}</p>
                    {inbox.description && (
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-white/70' : 'text-neutral-400'
                        }`}
                      >
                        {inbox.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {inboxTasks.length}
                  </span>

                  {/* Allow deleting non-default inboxes */}
                  {inbox.id !== 'inbox-general' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete inbox "${inbox.name}"? Tasks will move to General Inbox.`)) {
                          storage.deleteInbox(inbox.id);
                          if (selectedInboxId === inbox.id) {
                            setSelectedInboxId('all');
                          }
                        }
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 rounded transition-opacity"
                      title="Delete inbox"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Add Tasks Under Selected Inbox & List (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          {/* Add Task Directly Under this Inbox */}
          <form
            onSubmit={handleAddTask}
            className="bg-white p-3.5 rounded-lg border border-[#ebebeb] shadow-subtle space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">
                Add task under{' '}
                <span className="text-primary font-bold">
                  {selectedInboxId === 'all'
                    ? inboxes[0]?.name || 'General Inbox'
                    : inboxes.find((i) => i.id === selectedInboxId)?.name}
                </span>
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What task needs to be captured?"
                className="flex-1 px-3 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40 flex items-center gap-1 shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1">
              <div className="flex items-center gap-1">
                <span>Priority:</span>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="bg-[#fafafa] border border-[#ebebeb] rounded px-1.5 py-0.5 text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span>Due:</span>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="bg-[#fafafa] border border-[#ebebeb] rounded px-1.5 py-0.5 text-xs"
                />
              </div>
            </div>
          </form>

          {/* Tasks List */}
          <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle overflow-hidden">
            <div className="p-3.5 bg-[#fafafa] border-b border-[#ebebeb] flex items-center justify-between text-xs text-neutral-600 font-medium">
              <span>Tasks ({filteredTasks.length})</span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {filteredTasks.filter((t) => t.completed).length} completed
              </span>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-neutral-700">No tasks in this inbox</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Type above to add tasks directly into this inbox.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#ebebeb]/70">
                {filteredTasks.map((task) => {
                  const inboxInfo = inboxes.find((i) => i.id === task.inboxId);
                  return (
                    <li
                      key={task.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => storage.toggleTask(task.id)}
                          className="flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-medium truncate ${
                              task.completed
                                ? 'line-through text-neutral-400'
                                : 'text-neutral-900'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                            {inboxInfo && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: inboxInfo.color || '#0068d6' }}
                                />
                                {inboxInfo.name}
                              </span>
                            )}
                            {task.dueDate && (
                              <span>Due {task.dueDate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.priority === 'high' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-600 font-medium border border-red-200/50">
                            High
                          </span>
                        )}

                        {/* 1-click schedule to today */}
                        <button
                          onClick={() => handleScheduleForToday(task.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-700 hover:text-primary hover:bg-[#ebf5ff] rounded transition-colors"
                          title="Schedule for Today"
                        >
                          <Sun className="w-3 h-3 text-amber-500" />
                          <span>Today</span>
                        </button>

                        <button
                          onClick={() => storage.deleteTask(task.id)}
                          className="p-1 text-neutral-300 hover:text-red-500 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
