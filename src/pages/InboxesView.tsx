import React, { useState } from 'react';
import {
  Plus,
  Trash2,
} from 'lucide-react';
import { Inbox, Goal, Habit } from '../types';
import { GoalItem } from '../components/GoalItem';

interface InboxesViewProps {
  inboxes: Inbox[];
  goals: Goal[];
  habits: Habit[];
  onAddInbox: (name: string, description?: string, color?: string) => void;
  onDeleteInbox: (id: string) => void;
  onAddGoal: (title: string, inboxId: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  selectedInboxId?: string;
}

export const InboxesView: React.FC<InboxesViewProps> = ({
  inboxes,
  goals,
  habits,
  onAddInbox,
  onDeleteInbox,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  selectedInboxId,
}) => {
  const [activeInboxId, setActiveInboxId] = useState<string>(
    selectedInboxId || inboxes[0]?.id || 'work'
  );
  const [showAddInbox, setShowAddInbox] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#3b82f6');

  // Quick goal add inside active inbox
  const [goalTitle, setGoalTitle] = useState('');

  const activeInbox = inboxes.find((ib) => ib.id === activeInboxId) || inboxes[0];
  const inboxGoals = goals.filter((g) => g.inboxId === activeInbox?.id);

  const handleCreateInbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddInbox(name.trim(), desc.trim() || undefined, color);
    setName('');
    setDesc('');
    setShowAddInbox(false);
  };

  const handleQuickAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !activeInbox) return;
    onAddGoal(goalTitle.trim(), activeInbox.id);
    setGoalTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <span className="mono-label">DIMENSIONAL LIFE CAPTURE</span>
          <h1 className="font-sans text-xl md:text-2xl font-bold text-[var(--c5)]">
            Aspect Inboxes
          </h1>
        </div>

        <button
          onClick={() => setShowAddInbox(!showAddInbox)}
          className="uw-button uw-button-sm !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddInbox ? 'cancel' : 'new aspect inbox'}</span>
        </button>
      </div>

      {/* Create New Aspect Inbox Form */}
      {showAddInbox && (
        <form onSubmit={handleCreateInbox} className="uw-card space-y-3 border-[var(--c5)]">
          <span className="mono-label font-bold text-[var(--c5)]">CREATE ASPECT INBOX</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Inbox Name (e.g. Finances, Creative Writing)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] focus:outline-none focus:border-[var(--c5)]"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] focus:outline-none focus:border-[var(--c5)]"
            />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--c3)]">Color:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 cursor-pointer bg-transparent border border-[var(--border)]"
              />
              <button
                type="submit"
                className="ml-auto uw-button uw-button-sm !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)]"
              >
                save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Aspect Inbox Tabs / Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)]">
        {inboxes.map((ib) => {
          const isSelected = ib.id === activeInbox?.id;
          const count = goals.filter((g) => g.inboxId === ib.id && !g.completed).length;

          return (
            <button
              key={ib.id}
              onClick={() => setActiveInboxId(ib.id)}
              className={`flex items-center gap-2 px-3 py-2 border transition-colors shrink-0 font-mono text-xs ${
                isSelected
                  ? 'border-[var(--c5)] bg-[var(--c5)] text-[var(--bg)] font-bold'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--c1)] text-[var(--c4)]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ib.color || 'var(--c5)' }}
              />
              <span>{ib.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 border ${
                  isSelected
                    ? 'border-[var(--bg)] text-[var(--bg)]'
                    : 'border-[var(--border)] text-[var(--c3)] bg-[var(--c1)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Aspect Inbox Workspace */}
      {activeInbox && (
        <div className="space-y-5">
          <div className="uw-card space-y-3" style={{ borderLeftColor: activeInbox.color || 'var(--c5)', borderLeftWidth: 4 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="mono-label">ACTIVE ASPECT INBOX</span>
                <h2 className="font-sans text-lg font-bold text-[var(--c5)]">
                  {activeInbox.name}
                </h2>
                {activeInbox.description && (
                  <p className="mt-0.5 font-mono text-xs text-[var(--c3)]">
                    {activeInbox.description}
                  </p>
                )}
              </div>

              {/* Delete custom inbox if more than 1 remain */}
              {inboxes.length > 1 && !['work', 'personal', 'quick'].includes(activeInbox.id) && (
                <button
                  onClick={() => onDeleteInbox(activeInbox.id)}
                  className="uw-button uw-button-sm text-red-500 hover:border-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>delete inbox</span>
                </button>
              )}
            </div>

            {/* Quick Add Goal to This Aspect */}
            <form onSubmit={handleQuickAddGoal} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder={`Quick capture new task for ${activeInbox.name.toLowerCase()}...`}
                className="flex-1 px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] placeholder-[var(--c3)] focus:outline-none focus:border-[var(--c5)]"
              />
              <button
                type="submit"
                disabled={!goalTitle.trim()}
                className="uw-button uw-button-sm !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)] disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>add to inbox</span>
              </button>
            </form>
          </div>

          {/* Goals for this Aspect */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 font-mono text-xs">
              <span className="mono-label font-bold text-[var(--c5)]">
                TASKS & GOALS ({inboxGoals.length})
              </span>
              <span className="text-[var(--c3)]">
                {inboxGoals.filter((g) => g.completed).length} completed
              </span>
            </div>

            {inboxGoals.length === 0 ? (
              <div className="uw-card-flat p-8 text-center border-dashed border-[var(--border)]">
                <p className="font-mono text-xs text-[var(--c3)]">
                  No tasks in this inbox yet. Add one above!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {inboxGoals.map((goal) => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    inbox={activeInbox}
                    onToggleComplete={onToggleGoal}
                    onDeleteGoal={onDeleteGoal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
