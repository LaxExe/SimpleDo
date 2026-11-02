import React from 'react';
import { Check, Trash2, Clock, Inbox as InboxIcon } from 'lucide-react';
import { Goal, Inbox } from '../types';

interface GoalItemProps {
  goal: Goal;
  inbox?: Inbox;
  onToggleComplete: (id: string) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalItem: React.FC<GoalItemProps> = ({
  goal,
  inbox,
  onToggleComplete,
  onDeleteGoal,
}) => {
  const priorityColor =
    goal.priority === 'high'
      ? 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/5'
      : goal.priority === 'medium'
      ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5'
      : 'border-zinc-500/40 text-[var(--c3)] bg-zinc-500/5';

  return (
    <div
      className={`group flex items-start gap-3 p-3 border border-[var(--border)] transition-all ${
        goal.completed
          ? 'bg-[var(--c1)]/30 opacity-75'
          : 'bg-[var(--bg)] hover:border-[var(--c3)]'
      }`}
    >
      {/* Custom Checkbox */}
      <button
        onClick={() => onToggleComplete(goal.id)}
        className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
          goal.completed
            ? 'bg-[var(--c5)] border-[var(--c5)] text-[var(--bg)]'
            : 'border-[var(--border)] hover:border-[var(--c5)] bg-transparent'
        }`}
        aria-label={goal.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {goal.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {/* Goal Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-sans text-sm font-medium transition-all ${
              goal.completed
                ? 'line-through text-[var(--c3)]'
                : 'text-[var(--c5)]'
            }`}
          >
            {goal.title}
          </span>
        </div>

        {goal.notes && (
          <p className="mt-1 font-mono text-[11px] text-[var(--c3)] leading-relaxed">
            {goal.notes}
          </p>
        )}

        {/* Tags / Metadata */}
        <div className="mt-2 flex items-center gap-2 flex-wrap font-mono text-[10px]">
          {inbox && (
            <span
              className="px-2 py-0.5 border border-[var(--border)] text-[var(--c4)] bg-[var(--c1)]/50 flex items-center gap-1"
              style={{ borderLeftColor: inbox.color || 'var(--border)', borderLeftWidth: 3 }}
            >
              <InboxIcon className="w-2.5 h-2.5 text-[var(--c3)]" />
              {inbox.name}
            </span>
          )}

          <span className={`px-2 py-0.5 border text-[10px] lowercase ${priorityColor}`}>
            {goal.priority}
          </span>

          {goal.completed && goal.completedAt && (
            <span className="text-[var(--c3)] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              done {new Date(goal.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
        <button
          onClick={() => onDeleteGoal(goal.id)}
          className="p-1.5 text-[var(--c3)] hover:text-red-500 hover:bg-[var(--c1)] border border-transparent hover:border-[var(--border)] transition-colors"
          title="Remove goal"
          aria-label="Remove goal"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
