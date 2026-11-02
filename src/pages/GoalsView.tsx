import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Goal, Inbox, Priority } from '../types';
import { GoalItem } from '../components/GoalItem';

interface GoalsViewProps {
  goals: Goal[];
  inboxes: Inbox[];
  onAddGoal: (title: string, inboxId: string, priority: Priority, notes?: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onClearCompleted: () => void;
  initialInboxFilter?: string;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  inboxes,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onClearCompleted,
  initialInboxFilter,
}) => {
  const [search, setSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<string>(initialInboxFilter || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Add Goal Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [inboxId, setInboxId] = useState(inboxes[0]?.id || 'work');
  const [priority, setPriority] = useState<Priority>('medium');

  const filteredGoals = goals.filter((g) => {
    if (inboxFilter !== 'all' && g.inboxId !== inboxFilter) return false;
    if (priorityFilter !== 'all' && g.priority !== priorityFilter) return false;
    if (statusFilter === 'pending' && g.completed) return false;
    if (statusFilter === 'completed' && !g.completed) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchNotes = g.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  });

  const completedCount = goals.filter((g) => g.completed).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddGoal(title.trim(), inboxId, priority, notes.trim() || undefined);
    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <span className="mono-label">TASK & OBJECTIVE REGISTRY</span>
          <h1 className="font-sans text-xl md:text-2xl font-bold text-[var(--c5)]">
            Goals & Todo List
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="uw-button uw-button-sm !border-[var(--c5)] text-[var(--c5)]"
              title="Remove all completed goals"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>clear completed ({completedCount})</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="uw-button uw-button-sm !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'cancel' : 'new goal'}</span>
          </button>
        </div>
      </div>

      {/* Add Goal Drawer/Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="uw-card space-y-3 border-[var(--c5)]">
          <span className="mono-label font-bold text-[var(--c5)]">CREATE NEW GOAL</span>
          <div>
            <input
              type="text"
              required
              placeholder="What is your goal? (e.g. Finish UWExplorer style guide alignment)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] focus:outline-none focus:border-[var(--c5)]"
              autoFocus
            />
          </div>

          <div>
            <textarea
              placeholder="Additional notes, subtasks, or context (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] focus:outline-none focus:border-[var(--c5)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--c3)]">Aspect Inbox:</span>
              <select
                value={inboxId}
                onChange={(e) => setInboxId(e.target.value)}
                className="px-2.5 py-1.5 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c4)]"
              >
                {inboxes.map((ib) => (
                  <option key={ib.id} value={ib.id}>
                    {ib.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--c3)]">Priority:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="px-2.5 py-1.5 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c4)]"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="uw-button uw-button-sm"
              >
                cancel
              </button>
              <button
                type="submit"
                className="uw-button uw-button-sm !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)]"
              >
                save goal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-[var(--c3)]" />
          <input
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] text-[var(--c5)] placeholder-[var(--c3)] focus:outline-none focus:border-[var(--c5)]"
          />
        </div>

        {/* Inbox Filter */}
        <select
          value={inboxFilter}
          onChange={(e) => setInboxFilter(e.target.value)}
          className="px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] text-[var(--c4)] focus:outline-none focus:border-[var(--c5)]"
        >
          <option value="all">All Inboxes</option>
          {inboxes.map((ib) => (
            <option key={ib.id} value={ib.id}>
              {ib.name}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] text-[var(--c4)] focus:outline-none focus:border-[var(--c5)]"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Status Filter */}
        <div className="flex border border-[var(--border)] bg-[var(--c1)]/50">
          {(['all', 'pending', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 py-1.5 text-center transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--c5)] text-[var(--bg)] font-semibold'
                  : 'text-[var(--c3)] hover:text-[var(--c5)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Listing */}
      <div className="space-y-2">
        {filteredGoals.length === 0 ? (
          <div className="uw-card-flat p-12 text-center border-dashed border-[var(--border)]">
            <p className="font-mono text-xs text-[var(--c3)]">
              No matching goals found.
            </p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              inbox={inboxes.find((ib) => ib.id === goal.inboxId)}
              onToggleComplete={onToggleGoal}
              onDeleteGoal={onDeleteGoal}
            />
          ))
        )}
      </div>
    </div>
  );
};
