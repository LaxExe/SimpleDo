import React, { useState } from 'react';
import { Task, Habit } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getTodayStr } from '../services/storage';

interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tasks: Task[];
  habits: Habit[];
  onDropTaskOnDate?: (taskId: string, targetDate: string) => void;
  onDropHabitOnDate?: (habitId: string, targetDate: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  tasks,
  onDropTaskOnDate,
  onDropHabitOnDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const parts = selectedDate.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  });

  const todayStr = getTodayStr();

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(todayStr);
  };

  // Build tasks-by-date map
  const taskCountByDate: Record<string, { total: number; pending: number }> = {};
  tasks.forEach((task) => {
    const date = task.scheduledDate || task.dueDate;
    if (date) {
      if (!taskCountByDate[date]) {
        taskCountByDate[date] = { total: 0, pending: 0 };
      }
      taskCountByDate[date].total++;
      if (!task.completed) {
        taskCountByDate[date].pending++;
      }
    }
  });

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    cells.push({ day, dateStr });
  }

  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle p-4 sm:p-5">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-neutral-900 tracking-tight">
            {monthName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleJumpToToday}
            className="px-2 py-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] rounded border border-[#ebebeb] transition-colors mr-1"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-[#fafafa] rounded transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-[#fafafa] rounded transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-neutral-400 mb-2 font-mono">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-9 sm:h-11" />;
          }

          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === todayStr;
          const counts = taskCountByDate[cell.dateStr];
          const isOver = dragOverDate === cell.dateStr;

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDate(cell.dateStr);
              }}
              onDragLeave={() => {
                setDragOverDate(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverDate(null);
                const taskId = e.dataTransfer.getData('text/plain-task');
                const habitId = e.dataTransfer.getData('text/plain-habit');
                if (taskId && onDropTaskOnDate) {
                  onDropTaskOnDate(taskId, cell.dateStr);
                } else if (habitId && onDropHabitOnDate) {
                  onDropHabitOnDate(habitId, cell.dateStr);
                }
              }}
              className={`h-9 sm:h-11 rounded-md flex flex-col items-center justify-center relative cursor-pointer transition-all select-none ${
                isSelected
                  ? 'bg-neutral-900 text-white font-medium shadow-sm'
                  : isOver
                  ? 'bg-blue-50 border-2 border-dashed border-primary text-primary'
                  : isToday
                  ? 'bg-neutral-100 text-neutral-900 font-semibold border border-neutral-300'
                  : 'hover:bg-[#fafafa] text-neutral-800'
              }`}
            >
              <span className="text-xs leading-none">{cell.day}</span>

              {/* Task Indicator dots */}
              {counts && counts.total > 0 && (
                <div className="flex items-center gap-0.5 mt-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? 'bg-blue-300'
                        : counts.pending > 0
                        ? 'bg-primary'
                        : 'bg-green-500'
                    }`}
                  />
                  {counts.total > 1 && (
                    <span
                      className={`text-[9px] font-mono leading-none ${
                        isSelected ? 'text-white/80' : 'text-neutral-400'
                      }`}
                    >
                      {counts.total}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-[#ebebeb] flex items-center justify-between text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Active tasks</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Completed</span>
        </span>
        <span className="text-[10px] text-neutral-400 italic">
          Drag tasks or habits to date
        </span>
      </div>
    </div>
  );
};
