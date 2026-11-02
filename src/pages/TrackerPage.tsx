import React, { useState } from 'react';
import { Habit } from '../types';
import { storage } from '../services/storage';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Flame, 
  Trophy, 
  Check 
} from 'lucide-react';

interface TrackerPageProps {
  habits: Habit[];
}

export const TrackerPage: React.FC<TrackerPageProps> = ({ habits }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Daily Routine');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays'>('daily');

  // Generate last 7 days (today included at rightmost)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const dayNumber = d.getDate();
    const isToday = i === 6;
    return { dateStr, dayName, dayNumber, isToday };
  });

  const todayStr = days[6].dateStr;

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    storage.addHabit({
      name: name.trim(),
      category: category.trim() || 'General',
      frequency,
    });

    setName('');
    setIsAdding(false);
  };

  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
  const habitsDoneToday = habits.filter((h) => h.completedDates.includes(todayStr)).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Habit Tracker
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Build discipline with consistent daily routines and visual streaks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Close Form' : 'New Habit'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-[#ebebeb] shadow-subtle">
          <div className="text-xs text-neutral-500 font-medium">Completed Today</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {habitsDoneToday} <span className="text-xs text-neutral-400 font-normal">/ {habits.length}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#ebebeb] shadow-subtle">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Active Streaks Combined</span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {totalStreaks} <span className="text-xs text-neutral-400 font-normal">days</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#ebebeb] shadow-subtle">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Total Tracked Habits</span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {habits.length}
          </div>
        </div>
      </div>

      {/* Add Habit Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleAddHabit}
          className="bg-white p-4 rounded-lg border border-[#ebebeb] shadow-subtle space-y-3"
        >
          <div className="text-xs font-semibold text-neutral-900">Define a New Habit</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 30 Minutes Reading, Gym, Meditate..."
            autoFocus
            className="w-full px-3 py-2 text-sm bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Category:</span>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="text-xs bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-1 w-32 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Frequency:</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekdays')}
                className="text-xs bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-1 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-3.5 py-1 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors disabled:opacity-50"
              >
                Create Habit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Habit Tracker Table / Cards */}
      <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle overflow-hidden">
        {habits.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800">No habits tracked yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Track repeated actions like hydration, exercise, deep work, or reading to build lasting streaks.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ebebeb]/70">
            {/* Table Header with Days */}
            <div className="p-3 sm:px-5 flex items-center justify-between bg-[#fafafa] text-neutral-400 font-mono text-[11px] border-b border-[#ebebeb]">
              <span className="w-48 sm:w-64 font-sans font-medium text-neutral-600">Habit</span>
              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-xs">
                {days.map((d) => (
                  <div
                    key={d.dateStr}
                    className={`flex flex-col items-center w-7 sm:w-8 text-center ${
                      d.isToday ? 'text-primary font-bold' : ''
                    }`}
                  >
                    <span>{d.dayName}</span>
                    <span className="text-[10px] opacity-75">{d.dayNumber}</span>
                  </div>
                ))}
              </div>
              <div className="w-16 sm:w-20 text-right pr-2">Streak</div>
            </div>

            {/* Habit Rows */}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="p-3 sm:px-5 flex items-center justify-between gap-2 hover:bg-[#fafafa]/50 transition-colors group"
              >
                {/* Left: Name & Category */}
                <div className="w-48 sm:w-64 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900 truncate">
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                    <span>{habit.category}</span>
                    <span>•</span>
                    <span>{habit.frequency}</span>
                  </div>
                </div>

                {/* Middle: 7-Day interactive check circles */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-xs">
                  {days.map((d) => {
                    const isCompleted = habit.completedDates.includes(d.dateStr);
                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => storage.toggleHabitDate(habit.id, d.dateStr)}
                        title={`${d.dateStr}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800'
                            : d.isToday
                            ? 'border-2 border-dashed border-primary/60 hover:border-primary text-transparent hover:text-primary'
                            : 'bg-neutral-100 hover:bg-neutral-200/80 text-transparent hover:text-neutral-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    );
                  })}
                </div>

                {/* Right: Streak & Actions */}
                <div className="w-16 sm:w-20 flex items-center justify-end gap-1.5 pl-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono font-medium text-neutral-700">
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        habit.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-neutral-300'
                      }`}
                    />
                    <span>{habit.streak}</span>
                  </div>
                  <button
                    onClick={() => storage.deleteHabit(habit.id)}
                    className="p-1 text-neutral-300 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
