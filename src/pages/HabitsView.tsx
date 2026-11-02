import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Check,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Habit, Inbox } from '../types';
import { getTodayDateString } from '../services/storage';

interface HabitsViewProps {
  habits: Habit[];
  inboxes: Inbox[];
  onAddHabit: (title: string, inboxId: string, description?: string) => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  inboxes,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inboxId, setInboxId] = useState(inboxes[0]?.id || 'fitness');

  const today = getTodayDateString();

  // 30 Days generation for heatmap
  const past30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return {
      dateKey,
      dayNumber: d.getDate(),
      isToday: dateKey === today,
    };
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddHabit(title.trim(), inboxId, description.trim() || undefined);
    setTitle('');
    setDescription('');
    setShowAddForm(false);
  };

  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
  const completedTodayCount = habits.filter((h) => Boolean(h.history[today])).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <span className="mono-label">CONSISTENCY & HABIT PROTOCOL</span>
          <h1 className="font-sans text-xl md:text-2xl font-bold text-[var(--c5)]">
            Daily Habit Tracker
          </h1>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="uw-button uw-button-sm !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'cancel' : 'new habit'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="uw-card p-4">
          <span className="mono-label">TODAY'S ADHERENCE</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[var(--c5)]">
              {completedTodayCount}/{habits.length}
            </span>
            <span className="font-mono text-xs text-[var(--c3)]">
              ({habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="uw-card p-4">
          <span className="mono-label">CUMULATIVE STREAK</span>
          <div className="mt-1 flex items-baseline gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="font-mono text-2xl font-bold text-[var(--c5)]">
              {totalStreaks}
            </span>
            <span className="font-mono text-xs text-[var(--c3)]">days total</span>
          </div>
        </div>

        <div className="uw-card p-4">
          <span className="mono-label">ACTIVE PROTOCOLS</span>
          <div className="mt-1 flex items-baseline gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--c4)]" />
            <span className="font-mono text-2xl font-bold text-[var(--c5)]">
              {habits.length}
            </span>
            <span className="font-mono text-xs text-[var(--c3)]">habits tracked</span>
          </div>
        </div>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="uw-card space-y-3 border-[var(--c5)]">
          <span className="mono-label font-bold text-[var(--c5)]">DEFINE NEW HABIT</span>
          <div>
            <input
              type="text"
              required
              placeholder="Habit title (e.g. Read 20 pages, Walk 8,000 steps)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] focus:outline-none focus:border-[var(--c5)]"
              autoFocus
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Why this habit matters or specific rule (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                create habit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Habit Cards & 30-Day Heatmaps */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const isDoneToday = Boolean(habit.history[today]);
          const inbox = inboxes.find((ib) => ib.id === habit.inboxId);

          return (
            <div key={habit.id} className="uw-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans text-base font-bold text-[var(--c5)]">
                      {habit.title}
                    </h3>
                    {inbox && (
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 border border-[var(--border)] text-[var(--c4)]"
                        style={{ borderLeftColor: inbox.color || 'var(--border)', borderLeftWidth: 3 }}
                      >
                        {inbox.name}
                      </span>
                    )}
                  </div>
                  {habit.description && (
                    <p className="mt-1 font-mono text-xs text-[var(--c3)]">
                      {habit.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 font-mono text-sm font-semibold text-amber-500">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{habit.streak} day streak</span>
                  </div>

                  <button
                    onClick={() => onToggleHabit(habit.id)}
                    className={`uw-button uw-button-sm !px-3 font-mono text-xs ${
                      isDoneToday
                        ? 'bg-[var(--c5)] text-[var(--bg)] border-[var(--c5)] font-semibold'
                        : 'hover:border-[var(--c5)]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isDoneToday ? 'completed today' : 'check off today'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1.5 text-[var(--c3)] hover:text-red-500 hover:bg-[var(--c1)] transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 30-Day Adherence Grid */}
              <div className="space-y-1.5 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--c3)]">
                  <span>30-DAY TIMELINE</span>
                  <span>TODAY</span>
                </div>

                <div className="grid grid-cols-15 sm:grid-cols-30 gap-1 overflow-x-auto pb-1">
                  {past30Days.map((d) => {
                    const done = Boolean(habit.history[d.dateKey]);
                    return (
                      <div
                        key={d.dateKey}
                        className={`h-6 border flex items-center justify-center font-mono text-[9px] transition-colors ${
                          done
                            ? 'bg-[var(--c5)] border-[var(--c5)] text-[var(--bg)] font-bold'
                            : d.isToday
                            ? 'border-dashed border-[var(--c4)] bg-transparent text-[var(--c4)]'
                            : 'border-[var(--border)] bg-[var(--c1)]/30 text-[var(--c3)]/40'
                        }`}
                        title={`${d.dateKey}: ${done ? 'Complete' : 'Incomplete'}`}
                      >
                        {d.dayNumber}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
