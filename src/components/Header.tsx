import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, HardDrive } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenDailyReview: () => void;
  completedGoalsCount: number;
  diskSyncStatus: 'synced' | 'saving' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenDailyReview,
  completedGoalsCount,
  diskSyncStatus,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }) + ' • ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm transition-colors select-none">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between min-h-[56px]">
        {/* Left: Branding & Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-[var(--c5)]" />
            <span className="font-mono text-xs md:text-sm font-bold tracking-widest text-[var(--c5)]">
              SIMPLEDO
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 border border-[var(--border)] text-[var(--c3)]">
              v1.0
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-[var(--c3)] pl-3 border-l border-[var(--border)]">
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Right: Storage Status, End of Day, and Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Disk storage status indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border)] font-mono text-[11px] text-[var(--c3)]"
            title="Data is persisted to disk in data/simpledo_db.json"
          >
            <HardDrive className="w-3 h-3 text-[var(--c4)]" />
            <span className="hidden sm:inline">
              {diskSyncStatus === 'synced' && 'DISK SYNCED'}
              {diskSyncStatus === 'saving' && 'SAVING...'}
              {diskSyncStatus === 'offline' && 'LOCAL CACHE'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                diskSyncStatus === 'synced'
                  ? 'bg-emerald-500'
                  : diskSyncStatus === 'saving'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-zinc-400'
              }`}
            />
          </div>

          {/* End of day trigger button */}
          <button
            onClick={onOpenDailyReview}
            className="uw-button uw-button-sm flex items-center gap-1.5"
            title="Review accomplishments and clear completed goals"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono text-[11px]">end of day</span>
            {completedGoalsCount > 0 && (
              <span className="bg-[var(--c5)] text-[var(--bg)] px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-sm">
                {completedGoalsCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="uw-button uw-button-sm !px-2.5"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-[var(--c4)]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[var(--c4)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
