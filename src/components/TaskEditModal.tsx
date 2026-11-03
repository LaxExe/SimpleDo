import React, { useState } from 'react';
import { Task, InboxGroup, Priority } from '../types';
import { storage } from '../services/storage';
import { X, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';

interface TaskEditModalProps {
  task: Task | null;
  inboxes: InboxGroup[];
  onClose: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  inboxes,
  onClose,
}) => {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [inboxId, setInboxId] = useState(task.inboxId || inboxes[0]?.id || 'inbox-general');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [scheduledDate, setScheduledDate] = useState(task.scheduledDate || '');
  const [completedParts, setCompletedParts] = useState(task.completed ? 4 : (task.completedParts ?? 0));
  const [hasProgress, setHasProgress] = useState(Boolean(task.hasProgress));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedInbox = inboxes.find((i) => i.id === inboxId);

    storage.updateTask(task.id, {
      title: title.trim(),
      priority,
      inboxId,
      category: selectedInbox?.name || 'General',
      dueDate: dueDate || undefined,
      scheduledDate: scheduledDate || undefined,
      hasProgress: Boolean(hasProgress),
      completedParts: hasProgress ? completedParts : 0,
      completed: task.completed,
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      storage.deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl border border-[#ebebeb] shadow-modal max-w-lg w-full p-5 sm:p-6 space-y-5 animate-scaleIn max-h-[92vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
          <h2 className="text-sm font-semibold text-neutral-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full px-3 py-2 text-base sm:text-sm bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-neutral-700 mb-1">
                <Tag className="w-3 h-3 text-neutral-400" />
                <span>Inbox</span>
              </label>
              <select
                value={inboxId}
                onChange={(e) => setInboxId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              >
                {inboxes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-neutral-700 mb-1">
                <AlertCircle className="w-3 h-3 text-neutral-400" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-neutral-700 mb-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span>Scheduled for Day (Day Planner)</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-neutral-700 mb-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span>Due Date (Optional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Task Progress (4 parts) */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Progress (4 parts)
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setHasProgress(false);
                  setCompletedParts(0);
                }}
                className={`px-2.5 py-1 text-xs rounded-md border font-mono transition-all ${
                  !hasProgress
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-600 border-[#ebebeb] hover:bg-neutral-50'
                }`}
              >
                None (No Bar)
              </button>
              {[0, 1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setHasProgress(true);
                    setCompletedParts(p);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md border font-mono transition-all ${
                    completedParts === p && hasProgress
                      ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                      : 'bg-white text-neutral-600 border-[#ebebeb] hover:bg-neutral-50'
                  }`}
                >
                  {p}/4
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#ebebeb]">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40 shadow-subtle"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
