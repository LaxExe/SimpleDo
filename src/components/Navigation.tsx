import React from 'react';
import { Page } from '../types';
import { CheckSquare, Inbox, Activity, Sun } from 'lucide-react';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  todayTasksCount: number;
  pendingTasksCount: number;
  inboxTasksCount: number;
  habitsTodayDone: { done: number; total: number };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  todayTasksCount,
  pendingTasksCount,
  inboxTasksCount,
  habitsTodayDone,
}) => {
  const tabs = [
    {
      id: 'today' as Page,
      label: 'Today',
      icon: Sun,
      badge: todayTasksCount > 0 ? todayTasksCount : undefined,
    },
    {
      id: 'tasks' as Page,
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'inbox' as Page,
      label: 'Inbox',
      icon: Inbox,
      badge: inboxTasksCount > 0 ? inboxTasksCount : undefined,
    },
    {
      id: 'tracker' as Page,
      label: 'Tracker',
      icon: Activity,
      badge:
        habitsTodayDone.total > 0
          ? `${habitsTodayDone.done}/${habitsTodayDone.total}`
          : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand: just "simple do", no icon, no subtitle */}
        <div 
          onClick={() => onNavigate('today')}
          className="cursor-pointer select-none"
        >
          <span className="font-semibold text-base tracking-tight text-neutral-900 lowercase hover:opacity-80 transition-opacity">
            simple do
          </span>
        </div>

        {/* 4 Tabs Navigation */}
        <nav className="flex items-center p-1 bg-[#ebebeb]/60 rounded-full border border-[#ebebeb]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                      isActive
                        ? 'bg-[#ebf5ff] text-[#0068d6]'
                        : 'bg-neutral-200/70 text-neutral-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Date Indicator */}
        <div className="hidden sm:flex items-center text-xs text-neutral-500 font-mono">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>
    </header>
  );
};
