import React, { useState } from 'react';
import { Page, Task, Habit } from '../types';
import { storage } from '../services/storage';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Flame, 
  Inbox, 
  CheckSquare, 
  Calendar 
} from 'lucide-react';

interface HomePageProps {
  tasks: Task[];
  habits: Habit[];
  inboxCount: number;
  onNavigate: (page: Page) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  tasks,
  habits,
  inboxCount,
  onNavigate,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  const habitsDoneToday = habits.filter((h) => h.completedDates.includes(todayStr));
  const habitsPercentage = habits.length > 0
    ? Math.round((habitsDoneToday.length / habits.length) * 100)
    : 0;

  const handleQuickInbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    storage.addInboxItem(quickInput);
    setQuickInput('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#ebebeb]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Today's Dashboard
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Focus on what matters. Track your daily habits and conquer your to-do list.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('tasks')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => onNavigate('inbox')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded-full transition-colors shadow-subtle"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox ({inboxCount})</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Tasks */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="group cursor-pointer p-5 bg-white rounded-lg border border-[#ebebeb] shadow-subtle hover:shadow-subtle-hover transition-all duration-150"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Active Tasks</span>
            <CheckSquare className="w-4 h-4 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-neutral-900 tracking-tight">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-neutral-500">
              of {tasks.length} remaining
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-600 pt-3 border-t border-[#ebebeb]/60">
            <span>{completionRate}% completed</span>
            <span className="text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View tasks <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Habits Today */}
        <div 
          onClick={() => onNavigate('tracker')}
          className="group cursor-pointer p-5 bg-white rounded-lg border border-[#ebebeb] shadow-subtle hover:shadow-subtle-hover transition-all duration-150"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Habits Today</span>
            <Flame className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-neutral-900 tracking-tight">
              {habitsDoneToday.length}
            </span>
            <span className="text-xs text-neutral-500">
              of {habits.length} habits done
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-600 pt-3 border-t border-[#ebebeb]/60">
            <span>{habitsPercentage}% checked off</span>
            <span className="text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Tracker <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Quick Capture */}
        <div className="p-5 bg-white rounded-lg border border-[#ebebeb] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Quick Note</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-neutral-600 mb-3">
              Drop an idea or task directly into your inbox.
            </p>
          </div>
          <form onSubmit={handleQuickInbox} className="flex gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Jot down a thought..."
              className="flex-1 px-3 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid: Today's Priorities & Today's Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks Panel */}
        <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ebebeb]">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-neutral-700" />
              <h2 className="text-sm font-semibold text-neutral-900">Today's Focus</h2>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              All tasks <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-neutral-800">All caught up!</p>
              <p className="text-xs text-neutral-500 mt-0.5">No pending tasks for today.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#ebebeb]/60">
              {pendingTasks.slice(0, 5).map((task) => (
                <li
                  key={task.id}
                  className="py-2.5 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => storage.toggleTask(task.id)}
                      className="text-neutral-400 hover:text-primary transition-colors flex-shrink-0"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium text-neutral-800 truncate">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.priority === 'high' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                        High
                      </span>
                    )}
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {task.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Habits Checklist Panel */}
        <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ebebeb]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-neutral-900">Today's Habits</h2>
            </div>
            <button
              onClick={() => onNavigate('tracker')}
              className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              Full tracker <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-neutral-800">No habits added yet</p>
              <button
                onClick={() => onNavigate('tracker')}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Create your first habit
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#ebebeb]/60">
              {habits.map((habit) => {
                const isDone = habit.completedDates.includes(todayStr);
                return (
                  <li
                    key={habit.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => storage.toggleHabitDate(habit.id, todayStr)}
                        className={`transition-colors flex-shrink-0 ${
                          isDone ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`text-xs font-medium truncate ${
                          isDone ? 'line-through text-neutral-400' : 'text-neutral-800'
                        }`}
                      >
                        {habit.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] text-neutral-500 font-mono">
                      <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? 'text-orange-500' : 'text-neutral-300'}`} />
                      <span>{habit.streak}d</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
