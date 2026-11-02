import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Trash2,
  Flame,
  Calendar,
} from 'lucide-react';
import { DailyLog, Habit, Goal } from '../types';
import { getTodayDateString } from '../services/storage';

interface DailyReviewViewProps {
  goals: Goal[];
  habits: Habit[];
  dailyLogs: DailyLog[];
  onPerformSweep: (reflection: string) => void;
  onClearIndividualGoal: (id: string) => void;
}

export const DailyReviewView: React.FC<DailyReviewViewProps> = ({
  goals,
  habits,
  dailyLogs,
  onPerformSweep,
  onClearIndividualGoal,
}) => {
  const [reflection, setReflection] = useState('');
  const [sweepSuccess, setSweepSuccess] = useState(false);

  const today = getTodayDateString();
  const completedGoals = goals.filter((g) => g.completed);
  const pendingGoals = goals.filter((g) => !g.completed);
  const habitsDoneToday = habits.filter((h) => Boolean(h.history[today])).length;

  const handleSweep = () => {
    onPerformSweep(reflection.trim());
    setSweepSuccess(true);
    setReflection('');
    setTimeout(() => setSweepSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-[var(--border)] pb-4">
        <span className="mono-label">END OF DAY RITUAL & RESET</span>
        <h1 className="font-sans text-xl md:text-2xl font-bold text-[var(--c5)]">
          Daily Review & Sweep
        </h1>
        <p className="mt-1 font-mono text-xs text-[var(--c3)]">
          Review what you accomplished today, check off your final targets, and clear completed goals for a fresh start tomorrow.
        </p>
      </div>

      {sweepSuccess && (
        <div className="p-4 border border-emerald-500/40 bg-emerald-500/10 font-mono text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed goals have been archived to disk and cleared from your active list!</span>
        </div>
      )}

      {/* Accomplishment Summary Card */}
      <div className="uw-card space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-sans text-base font-bold text-[var(--c5)]">
              Today's Accomplishments ({today})
            </h3>
          </div>

          <span className="font-mono text-xs text-[var(--c3)]">
            {completedGoals.length} goal{completedGoals.length === 1 ? '' : 's'} met
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 border border-[var(--border)] bg-[var(--c1)]/30">
            <span className="mono-label">GOALS MET TODAY</span>
            <div className="mt-1 font-mono text-xl font-bold text-[var(--c5)]">
              {completedGoals.length} / {goals.length}
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-[var(--c3)]">
              {pendingGoals.length} remaining goal{pendingGoals.length === 1 ? '' : 's'} will carry over
            </p>
          </div>

          <div className="p-3 border border-[var(--border)] bg-[var(--c1)]/30">
            <span className="mono-label">HABITS CHECKED OFF</span>
            <div className="mt-1 font-mono text-xl font-bold text-[var(--c5)] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{habitsDoneToday} / {habits.length}</span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-[var(--c3)]">
              {habits.length > 0 ? Math.round((habitsDoneToday / habits.length) * 100) : 0}% habit adherence
            </p>
          </div>
        </div>

        {/* List of Met Goals */}
        <div className="space-y-2 pt-2">
          <span className="mono-label font-bold text-[var(--c4)]">
            COMPLETED GOALS TO BE CLEARED ({completedGoals.length})
          </span>

          {completedGoals.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-[var(--border)] font-mono text-xs text-[var(--c3)]">
              No completed goals yet today. Check off your goals on the dashboard as you finish them!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {completedGoals.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-2.5 border border-[var(--border)] bg-[var(--c1)]/20 font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--c5)]" />
                    <span className="text-[var(--c5)] font-medium">{g.title}</span>
                  </div>

                  <button
                    onClick={() => onClearIndividualGoal(g.id)}
                    className="text-[var(--c3)] hover:text-red-500 p-1"
                    title="Remove from board immediately"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reflection Box */}
        <div className="space-y-1.5 pt-2">
          <span className="mono-label">EVENING REFLECTION & NOTES (OPTIONAL)</span>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What went well today? What will you prioritize tomorrow? Any notes to save to your archive..."
            rows={3}
            className="w-full px-3 py-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-xs text-[var(--c5)] placeholder-[var(--c3)] focus:outline-none focus:border-[var(--c5)]"
          />
        </div>

        {/* Primary Action Button */}
        <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-[11px] text-[var(--c3)]">
            Sweeping clears completed goals and saves today's log to persistent disk storage.
          </div>

          <button
            onClick={handleSweep}
            disabled={completedGoals.length === 0}
            className="w-full sm:w-auto uw-button !bg-[var(--c5)] !text-[var(--bg)] !border-[var(--c5)] disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>end day & sweep completed goals ({completedGoals.length})</span>
          </button>
        </div>
      </div>

      {/* Historical Daily Logs */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        <span className="mono-label font-bold text-[var(--c5)]">ARCHIVED DAILY LOGS</span>
        {dailyLogs.length === 0 ? (
          <div className="uw-card-flat p-8 text-center border-dashed border-[var(--border)] font-mono text-xs text-[var(--c3)]">
            No daily archives yet. Perform your first End of Day sweep above to build your streak record!
          </div>
        ) : (
          <div className="space-y-3">
            {dailyLogs.map((log) => (
              <div key={log.date} className="uw-card p-4 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2 font-bold text-[var(--c5)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--c3)]" />
                    <span>{log.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--c3)]">
                    <span>{log.goalsCompleted} goals cleared</span>
                    <span>•</span>
                    <span>{log.habitsCompleted} habits done</span>
                  </div>
                </div>

                {log.reflection && (
                  <p className="font-mono text-xs text-[var(--c4)] bg-[var(--c1)]/30 p-2 border border-[var(--border)] italic">
                    "{log.reflection}"
                  </p>
                )}

                {log.archivedGoals && log.archivedGoals.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                    {log.archivedGoals.map((ag) => (
                      <span
                        key={ag.id}
                        className="px-2 py-0.5 border border-[var(--border)] bg-[var(--bg)] text-[var(--c4)]"
                      >
                        ✓ {ag.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
