import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Goal, Habit, Inbox, Priority } from '../types';
import { GoalItem } from '../components/GoalItem';
import { HabitCard } from '../components/HabitCard';
import { InboxCard } from '../components/InboxCard';

interface DashboardViewProps {
  goals: Goal[];
  habits: Habit[];
  inboxes: Inbox[];
  onAddGoal: (title: string, inboxId: string, priority: Priority, notes?: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onOpenDailyReview: () => void;
  onSelectTab: (tab: string, filterId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  goals,
  habits,
  inboxes,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onToggleHabit,
  onDeleteHabit,
  onOpenDailyReview,
  onSelectTab,
}) => {
  // Quick Add State
  const [newTitle, setNewTitle] = useState('');
  const [selectedInbox, setSelectedInbox] = useState(inboxes[0]?.id || 'work');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [goalFilter, setGoalFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const pendingGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals.length / totalGoals) * 100) : 0;

  const filteredGoals = goals.filter((g) => {
    if (goalFilter === 'pending') return !g.completed;
    if (goalFilter === 'completed') return g.completed;
    return true;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddGoal(newTitle.trim(), selectedInbox, selectedPriority);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Add Bar */}
      <div className="uw-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <span className="mono-label">DAILY OBJECTIVE & HABIT HUB</span>
            <h1 className="font-sans text-xl md:text-2xl font-bold text-[var(--c5)] tracking-tight">
              Focus on today's goals
            </h1>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--c3)]">COMPLETION:</span>
              <span className="font-bold text-[var(--c5)]">{completionRate}%</span>
            </div>
            <div className="w-24 h-2 bg-[var(--c1)] border border-[var(--border)] overflow-hidden">
              <div
                className="h-full bg-[var(--c5)] transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Goal Creation Form */}
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Write a goal for today... (e.g., complete architecture draft)"
            className="flex-1 px-3.5 py-2.5 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] placeholder-[var(--c3)] focus:outline-none focus:border-[var(--c5)] transition-colors"
          />

          <div className="flex items-center gap-2">
            <select
              value={selectedInbox}
              onChange={(e) => setSelectedInbox(e.target.value)}
              className="px-3 py-2.5 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c4)] focus:outline-none focus:border-[var(--c5)]"
            >
              {inboxes.map((ib) => (
                <option key={ib.id} value={ib.id}>
                  {ib.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority)}
              className="px-3 py-2.5 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c4)] focus:outline-none focus:border-[var(--c5)]"
            >
              <option value="low">low priority</option>
              <option value="medium">med priority</option>
              <option value="high">high priority</option>
            </select>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="uw-button !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)] disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>add goal</span>
            </button>
          </div>
        </form>
      </div>

      {/* End-of-Day Callout Banner */}
      {completedGoals.length > 0 && (
        <div className="p-4 border border-[var(--border)] bg-gradient-to-r from-[var(--c1)]/60 to-[var(--bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-[var(--c5)]">
                Ready for End of Day sweep?
              </div>
              <div className="font-mono text-[11px] text-[var(--c3)]">
                You've met {completedGoals.length} goal{completedGoals.length === 1 ? '' : 's'} today. Check them off and clear them for tomorrow!
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDailyReview}
            className="uw-button uw-button-sm !border-[var(--c5)] !text-[var(--c5)] font-semibold shrink-0"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>review & sweep</span>
          </button>
        </div>
      )}

      {/* Two Column Grid: Goals (Left) & Habits (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Goals List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div className="flex items-center gap-2">
              <span className="mono-label font-bold text-[var(--c5)]">TODAY'S GOALS</span>
              <span className="font-mono text-[11px] text-[var(--c3)]">
                ({pendingGoals.length} remaining)
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {(['all', 'pending', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGoalFilter(filter)}
                  className={`px-2 py-0.5 border ${
                    goalFilter === filter
                      ? 'border-[var(--c5)] bg-[var(--c5)] text-[var(--bg)] font-semibold'
                      : 'border-transparent text-[var(--c3)] hover:text-[var(--c5)]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredGoals.length === 0 ? (
            <div className="uw-card-flat p-8 text-center border-dashed border-[var(--border)]">
              <p className="font-mono text-xs text-[var(--c3)]">
                {goalFilter === 'all'
                  ? 'No goals set for today yet. Use the bar above to add one!'
                  : `No ${goalFilter} goals found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGoals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  inbox={inboxes.find((ib) => ib.id === goal.inboxId)}
                  onToggleComplete={onToggleGoal}
                  onDeleteGoal={onDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Daily Habits */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="mono-label font-bold text-[var(--c5)]">DAILY HABITS</span>
            </div>
            <button
              onClick={() => onSelectTab('habits')}
              className="font-mono text-[11px] text-[var(--c3)] hover:text-[var(--c5)] flex items-center gap-1"
            >
              <span>manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="uw-card-flat p-8 text-center border-dashed border-[var(--border)]">
              <p className="font-mono text-xs text-[var(--c3)]">
                No habits created yet. Track recurring daily routines!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  inbox={inboxes.find((ib) => ib.id === habit.inboxId)}
                  onToggleToday={onToggleHabit}
                  onDeleteHabit={onDeleteHabit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aspect Inboxes Section */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="mono-label">ASPECT INBOXES</span>
            <h2 className="font-sans text-base font-bold text-[var(--c5)]">
              Track tasks across life dimensions
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('inboxes')}
            className="uw-button uw-button-sm font-mono text-[11px]"
          >
            <span>all inboxes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inboxes.map((inbox) => (
            <InboxCard
              key={inbox.id}
              inbox={inbox}
              goals={goals}
              onAddGoal={(title, inboxId) => onAddGoal(title, inboxId, 'medium')}
              onToggleGoal={onToggleGoal}
              onSelectInbox={(inboxId) => onSelectTab('inboxes', inboxId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
