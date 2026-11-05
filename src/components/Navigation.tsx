import React from 'react';
import { Page } from '../types';
import { CheckSquare, Activity, Sun } from 'lucide-react';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  todayTasksCount: number;
  pendingTasksCount: number;
  inboxTasksCount?: number;
  habitsTodayDone: { done: number; total: number };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  todayTasksCount,
  pendingTasksCount,
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
      label: 'To Do',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
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
    <>
      {/* Top Header: Clean Minimal Bar */}
      <header className="sticky top-0 z-40 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb] pt-safe">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between">
          {/* Brand: just "simple do", no icon */}
          <div 
            onClick={() => onNavigate('today')}
            className="cursor-pointer select-none"
          >
            <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-900 lowercase hover:opacity-80 transition-opacity">
              simple do
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center p-1 bg-[#ebebeb]/60 rounded-full border border-[#ebebeb]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                tab.id === 'tasks'
                  ? currentPage === 'tasks' || currentPage === 'inbox'
                  : currentPage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 select-none active:scale-95 ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50 font-normal'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-neutral-900 stroke-[2.5]' : 'text-neutral-500 stroke-[1.75]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-neutral-200 text-neutral-900 font-bold'
                          : 'bg-neutral-200/70 text-neutral-600 font-medium'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Date Display (Desktop only to prevent mobile clutter) */}
          <div className="hidden sm:flex items-center text-xs text-neutral-500 font-mono">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (iOS / Native App Feel) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebebeb] px-3 py-1.5 pb-safe shadow-modal">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.id === 'tasks'
                ? currentPage === 'tasks' || currentPage === 'inbox'
                : currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative active:scale-95 ${
                  isActive
                    ? 'text-neutral-900 font-semibold bg-neutral-100/70'
                    : 'text-neutral-500 hover:text-neutral-900 font-normal'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-neutral-900 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-1 transition-all ${isActive ? 'font-semibold text-neutral-900' : 'font-normal text-neutral-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
