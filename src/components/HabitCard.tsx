import React from 'react';
import { Flame, Check, Trash2, Award } from 'lucide-react';
import { Habit, Inbox } from '../types';
import { getTodayDateString } from '../services/storage';

interface HabitCardProps {
  habit: Habit;
  inbox?: Inbox;
  onToggleToday: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  inbox,
  onToggleToday,
  onDeleteHabit,
}) => {
  const today = getTodayDateString();
  const isCompletedToday = Boolean(habit.history[today]);

  // Last 7 days helper
  const pastDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const isDone = Boolean(habit.history[dateKey]);
    const isToday = dateKey === today;
    return { dateKey, dayName, isDone, isToday };
  });

  return (
    <div
      className={`uw-card p-4 flex flex-col justify-between transition-all ${
        isCompletedToday
          ? 'border-[var(--c4)] bg-[var(--c1)]/20'
          : 'border-[var(--border)]'
      }`}
    >
      <div>
        {/* Top Header: Title & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4
              className={`font-sans text-sm font-semibold transition-colors ${
                isCompletedToday ? 'text-[var(--c5)]' : 'text-[var(--c5)]'
              }`}
            >
              {habit.title}
            </h4>
            {habit.description && (
              <p className="mt-0.5 font-mono text-[11px] text-[var(--c3)] line-clamp-2">
                {habit.description}
              </p>
            )}
          </div>

          <button
            onClick={() => onDeleteHabit(habit.id)}
            className="text-[var(--c3)] hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 hover:bg-[var(--c1)] transition-all"
            title="Delete habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inbox Badge & Streaks */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          {inbox && (
            <span
              className="font-mono text-[10px] px-2 py-0.5 border border-[var(--border)] text-[var(--c4)] bg-[var(--c1)]/50"
              style={{ borderLeftColor: inbox.color || 'var(--border)', borderLeftWidth: 3 }}
            >
              {inbox.name}
            </span>
          )}

          <div className="flex items-center gap-3 font-mono text-xs">
            <div
              className={`flex items-center gap-1 ${
                habit.streak > 0
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-[var(--c3)]'
              }`}
              title="Current daily streak"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{habit.streak}d</span>
            </div>

            {habit.bestStreak > 0 && (
              <div
                className="flex items-center gap-1 text-[var(--c3)] text-[10px]"
                title="Best streak"
              >
                <Award className="w-3 h-3" />
                <span>best: {habit.bestStreak}d</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: 7-day mini tracker + Today button */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
        {/* Past 7 days history dots */}
        <div className="flex items-center gap-1.5">
          {pastDays.map((d) => (
            <div
              key={d.dateKey}
              className="flex flex-col items-center gap-1"
              title={`${d.dateKey}: ${d.isDone ? 'Completed' : 'Missed'}`}
            >
              <div
                className={`w-4 h-4 border flex items-center justify-center font-mono text-[8px] transition-colors ${
                  d.isDone
                    ? 'bg-[var(--c5)] border-[var(--c5)] text-[var(--bg)] font-bold'
                    : d.isToday
                    ? 'border-dashed border-[var(--c4)] bg-transparent'
                    : 'border-[var(--border)] bg-[var(--c1)]/50 text-[var(--c3)]'
                }`}
              >
                {d.isDone ? '✓' : ''}
              </div>
              <span className="font-mono text-[8px] text-[var(--c3)] uppercase">
                {d.dayName}
              </span>
            </div>
          ))}
        </div>

        {/* Toggle today button */}
        <button
          onClick={() => onToggleToday(habit.id)}
          className={`uw-button uw-button-sm !px-3 font-mono text-[11px] flex items-center gap-1.5 transition-all ${
            isCompletedToday
              ? 'bg-[var(--c5)] text-[var(--bg)] border-[var(--c5)] font-semibold'
              : 'hover:border-[var(--c5)]'
          }`}
        >
          <Check className="w-3 h-3" />
          <span>{isCompletedToday ? 'done today' : 'check off'}</span>
        </button>
      </div>
    </div>
  );
};
