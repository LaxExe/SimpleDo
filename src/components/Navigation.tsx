import React from 'react';
import { Page } from '../types';
import { CheckSquare, Inbox, Activity, Home, CheckCircle2 } from 'lucide-react';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  pendingTasksCount: number;
  inboxCount: number;
  habitsTodayDone: { done: number; total: number };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  pendingTasksCount,
  inboxCount,
  habitsTodayDone,
}) => {
  const tabs = [
    {
      id: 'home' as Page,
      label: 'Home',
      icon: Home,
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
      badge: inboxCount > 0 ? inboxCount : undefined,
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
        {/* Brand */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-semibold text-sm shadow-subtle group-hover:scale-105 transition-transform duration-150">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-neutral-900 leading-none">
              SimpleDo
            </span>
            <span className="text-[11px] text-neutral-500 font-normal leading-none mt-1">
              Habits & Tasks
            </span>
          </div>
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
