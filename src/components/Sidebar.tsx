import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Inbox as InboxIcon,
  Sparkles,
  Settings as SettingsIcon,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingGoalsCount: number;
  habitsDueCount: number;
  sidebarOrder: string[];
  onReorderSidebar: (newOrder: string[]) => void;
}

const ALL_NAV_ITEMS: Record<string, { label: string; icon: React.ElementType }> = {
  dashboard: { label: 'dashboard', icon: LayoutDashboard },
  goals: { label: 'goals & todo', icon: CheckSquare },
  habits: { label: 'habit tracker', icon: Flame },
  inboxes: { label: 'aspect inboxes', icon: InboxIcon },
  review: { label: 'end of day', icon: Sparkles },
  settings: { label: 'settings', icon: SettingsIcon },
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingGoalsCount,
  habitsDueCount,
  sidebarOrder,
  onReorderSidebar,
}) => {
  const [isReordering, setIsReordering] = useState(false);

  const currentOrder = [
    ...sidebarOrder.filter((id) => ALL_NAV_ITEMS[id]),
    ...Object.keys(ALL_NAV_ITEMS).filter((id) => !sidebarOrder.includes(id)),
  ];

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    onReorderSidebar(newOrder);
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === currentOrder.length - 1) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    onReorderSidebar(newOrder);
  };

  return (
    <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--bg)] min-h-0 md:min-h-[calc(100vh-56px)] p-3 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col gap-1">
        {/* Navigation title and Reorder button */}
        <div className="px-2.5 py-1.5 mb-2 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="mono-label font-bold text-[10px] text-[var(--c4)] tracking-wider">
              NAVIGATION
            </span>
          </div>

          <button
            onClick={() => setIsReordering(!isReordering)}
            className={`text-[var(--c3)] hover:text-[var(--c5)] p-1 transition-colors ${
              isReordering ? 'text-[var(--c5)] bg-[var(--c1)]' : ''
            }`}
            title="Rearrange sidebar items"
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {isReordering && (
          <div className="px-2 py-1 mb-2 bg-[var(--c1)]/50 border border-[var(--border)] font-mono text-[0.65rem] text-[var(--c3)]">
            Reorder items:
          </div>
        )}

        {/* Tab buttons */}
        <nav className="flex flex-col gap-1">
          {currentOrder.map((key, index) => {
            const item = ALL_NAV_ITEMS[key];
            if (!item) return null;
            const Icon = item.icon;
            const isActive = activeTab === key;

            return (
              <div key={key} className="flex items-center gap-1 group">
                <button
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-between px-3 py-2 text-left font-mono text-xs transition-colors border ${
                    isActive
                      ? 'border-[var(--c5)] bg-[var(--c5)] text-[var(--bg)] font-semibold'
                      : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--c1)] text-[var(--c4)] hover:text-[var(--c5)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--bg)]' : 'text-[var(--c3)]'}`} />
                    <span className="lowercase tracking-wider">{item.label}</span>
                  </div>

                  {key === 'goals' && pendingGoalsCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 border ${
                        isActive
                          ? 'border-[var(--bg)] text-[var(--bg)]'
                          : 'border-[var(--border)] text-[var(--c3)] bg-[var(--c1)]'
                      }`}
                    >
                      {pendingGoalsCount}
                    </span>
                  )}

                  {key === 'habits' && habitsDueCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 border ${
                        isActive
                          ? 'border-[var(--bg)] text-[var(--bg)]'
                          : 'border-[var(--border)] text-amber-600 dark:text-amber-400 bg-[var(--c1)]'
                      }`}
                    >
                      {habitsDueCount} due
                    </span>
                  )}
                </button>

                {isReordering && (
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={(e) => handleMoveUp(index, e)}
                      disabled={index === 0}
                      className="p-1 hover:bg-[var(--c1)] border border-[var(--border)] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => handleMoveDown(index, e)}
                      disabled={index === currentOrder.length - 1}
                      className="p-1 hover:bg-[var(--c1)] border border-[var(--border)] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-4 border-t border-[var(--border)] font-mono text-[10px] text-[var(--c3)] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>STORAGE</span>
          <span className="text-[var(--c4)] font-medium">JSON DISK</span>
        </div>
        <div className="flex items-center justify-between">
          <span>AUTH</span>
          <span className="text-[var(--c4)] font-medium">NONE (OPEN)</span>
        </div>
        <div className="mt-2 text-[9px] text-[var(--c3)]/70">
          data/simpledo_db.json
        </div>
      </div>
    </aside>
  );
};
