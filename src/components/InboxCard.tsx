import React, { useState } from 'react';
import { Plus, Check, ChevronRight } from 'lucide-react';
import { Inbox, Goal } from '../types';

interface InboxCardProps {
  inbox: Inbox;
  goals: Goal[];
  onAddGoal: (title: string, inboxId: string) => void;
  onToggleGoal: (id: string) => void;
  onSelectInbox: (inboxId: string) => void;
}

export const InboxCard: React.FC<InboxCardProps> = ({
  inbox,
  goals,
  onAddGoal,
  onToggleGoal,
  onSelectInbox,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const inboxGoals = goals.filter((g) => g.inboxId === inbox.id);
  const pendingGoals = inboxGoals.filter((g) => !g.completed);
  const completedGoals = inboxGoals.filter((g) => g.completed);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickInput.trim()) {
      onAddGoal(quickInput.trim(), inbox.id);
      setQuickInput('');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onAddGoal(quickInput.trim(), inbox.id);
      setQuickInput('');
    }
  };

  return (
    <div
      className="uw-card flex flex-col justify-between border-[var(--border)] transition-all hover:border-[var(--c3)]"
      style={{ borderTopColor: inbox.color || 'var(--c5)', borderTopWidth: 3 }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: inbox.color || 'var(--c5)' }}
            />
            <h3 className="font-sans text-sm font-bold text-[var(--c5)] truncate">
              {inbox.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--c3)] shrink-0">
            <span className="text-[var(--c5)] font-semibold">{pendingGoals.length}</span>
            <span>pending</span>
          </div>
        </div>

        {inbox.description && (
          <p className="mt-1.5 font-mono text-[11px] text-[var(--c3)] line-clamp-1">
            {inbox.description}
          </p>
        )}

        {/* Quick inline goal addition */}
        <form onSubmit={handleAddSubmit} className="mt-3 flex items-center gap-1.5">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`+ add to ${inbox.name.toLowerCase()}...`}
            className="flex-1 px-2.5 py-1.5 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] placeholder-[var(--c3)] focus:outline-none focus:border-[var(--c5)] transition-colors"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="uw-button uw-button-sm !px-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Add item"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Top 3 Pending Items Preview */}
        <div className="mt-3 flex flex-col gap-1.5">
          {pendingGoals.slice(0, 3).map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between gap-2 py-1 px-2 border border-[var(--border)] bg-[var(--bg)] group font-mono text-[11px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => onToggleGoal(goal.id)}
                  className="w-3.5 h-3.5 border border-[var(--border)] group-hover:border-[var(--c5)] flex items-center justify-center shrink-0"
                >
                  {goal.completed && <Check className="w-2.5 h-2.5" />}
                </button>
                <span className="truncate text-[var(--c4)] group-hover:text-[var(--c5)]">
                  {goal.title}
                </span>
              </div>
              <span className="text-[9px] uppercase px-1 border border-[var(--border)] text-[var(--c3)] shrink-0">
                {goal.priority}
              </span>
            </div>
          ))}

          {pendingGoals.length === 0 && (
            <div className="py-3 text-center font-mono text-[11px] text-[var(--c3)] italic border border-dashed border-[var(--border)]">
              All caught up in this aspect
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 pt-2 border-t border-[var(--border)] flex items-center justify-between font-mono text-[10px] text-[var(--c3)]">
        <span>
          {completedGoals.length} completed today
        </span>
        <button
          onClick={() => onSelectInbox(inbox.id)}
          className="hover:text-[var(--c5)] flex items-center gap-1 transition-colors"
        >
          <span>view inbox</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
