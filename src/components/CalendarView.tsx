import React, { useState } from 'react';
import { Task, Habit, DayPlan, InboxEvent } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Flame, Circle, Clock } from 'lucide-react';
import { getTodayStr } from '../services/storage';

interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tasks: Task[];
  events?: InboxEvent[];
  habits: Habit[];
  dayPlans: Record<string, DayPlan>;
  onDropTaskOnDate?: (taskId: string, targetDate: string) => void;
  onDropHabitOnDate?: (habitId: string, targetDate: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  tasks,
  events = [],
  dayPlans,
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

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    const date = task.scheduledDate || task.dueDate;
    if (date) {
      if (!tasksByDate[date]) {
        tasksByDate[date] = [];
      }
      tasksByDate[date].push(task);
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
    <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle overflow-hidden">
      {/* Calendar Top Toolbar - Clean Black Logo, No 2-tone Box */}
      <div className="p-4 sm:px-6 flex items-center justify-between border-b border-[#ebebeb] bg-[#fafafa]">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-neutral-900" />
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
              {monthName}
            </h2>
            <p className="text-xs text-neutral-500 hidden sm:block">
              Click a date to plan, or drag tasks and habits onto any day.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 rounded-md border border-[#ebebeb] transition-colors shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center border border-[#ebebeb] rounded-md bg-white overflow-hidden shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#ebebeb]" />
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-[#ebebeb] bg-[#fafafa]/80 text-center text-xs font-mono font-medium text-neutral-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
          <div key={weekday} className="py-2.5 border-r last:border-r-0 border-[#ebebeb]">
            {weekday}
          </div>
        ))}
      </div>

      {/* Large Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#ebebeb] bg-neutral-100/30">
        {cells.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[90px] sm:min-h-[115px] bg-[#fafafa]/50 p-1.5"
              />
            );
          }

          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === todayStr;
          const isOver = dragOverDate === cell.dateStr;

          const dateTasks = tasksByDate[cell.dateStr] || [];
          const datePlan = dayPlans[cell.dateStr];
          const plannedHabitsCount = datePlan?.plannedHabitIds?.length || 0;

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
              className={`min-h-[90px] sm:min-h-[115px] p-2 flex flex-col justify-between cursor-pointer transition-all select-none group ${
                isSelected
                  ? 'bg-neutral-100/60 ring-2 ring-inset ring-neutral-900 z-10'
                  : isOver
                  ? 'bg-neutral-100 border-2 border-dashed border-neutral-900'
                  : isToday
                  ? 'bg-white'
                  : 'bg-white hover:bg-[#fafafa]'
              }`}
            >
              {/* Day Header: Number + Indicators */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-medium inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                    isToday
                      ? 'bg-neutral-900 text-white font-bold'
                      : isSelected
                      ? 'bg-neutral-800 text-white font-bold'
                      : 'text-neutral-700 group-hover:text-neutral-900'
                  }`}
                >
                  {cell.day}
                </span>

                {/* Habit indicator if habits scheduled */}
                {plannedHabitsCount > 0 && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-mono text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded"
                    title={`${plannedHabitsCount} habits planned`}
                  >
                    <Flame className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                    <span>{plannedHabitsCount}</span>
                  </span>
                )}
              </div>

              {/* Task Items Preview */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {dateTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className={`text-[10px] truncate px-1.5 py-0.5 rounded flex items-center gap-1 border transition-colors ${
                      task.completed
                        ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through'
                        : task.priority === 'high'
                        ? 'bg-red-50 text-red-700 border-red-200/60 font-medium'
                        : 'bg-[#fafafa] text-neutral-800 border-[#ebebeb]'
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-neutral-900 flex-shrink-0" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 text-neutral-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}

                {dateTasks.length > 3 && (
                  <div className="text-[9px] font-mono text-neutral-400 pl-1">
                    +{dateTasks.length - 3} more tasks
                  </div>
                )}

                {/* Events Preview for this date */}
                {events
                  .filter((e) => e.date === cell.dateStr)
                  .slice(0, 2)
                  .map((evt) => (
                    <div
                      key={evt.id}
                      className="text-[10px] truncate px-1.5 py-0.5 rounded flex items-center gap-1 bg-neutral-100 text-neutral-800 border border-neutral-200"
                      title={`${evt.title} (${evt.time || 'All day'}${evt.location ? ` - ${evt.location}` : ''})`}
                    >
                      <Clock className="w-2.5 h-2.5 text-neutral-500 flex-shrink-0" />
                      {evt.time && <span className="font-mono font-medium">{evt.time}</span>}
                      <span className="truncate">{evt.title}</span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
