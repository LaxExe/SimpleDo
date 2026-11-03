import React, { useState } from 'react';
import { Task, Habit, DayPlan, InboxEvent, InboxGroup } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Flame, Circle, Clock } from 'lucide-react';
import { getTodayStr } from '../services/storage';

interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tasks: Task[];
  events?: InboxEvent[];
  inboxes?: InboxGroup[];
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
  inboxes = [],
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

  // Group tasks by date (both scheduled and due date)
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    const dates = new Set<string>();
    if (task.scheduledDate) dates.add(task.scheduledDate);
    if (task.dueDate) dates.add(task.dueDate);

    dates.forEach((d) => {
      if (!tasksByDate[d]) {
        tasksByDate[d] = [];
      }
      if (!tasksByDate[d].some((t) => t.id === task.id)) {
        tasksByDate[d].push(task);
      }
    });
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
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
            {monthName}
          </h2>
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

          // Filter completed tasks on calendar: only show if due date is set beyond today
          const allDateTasks = tasksByDate[cell.dateStr] || [];
          const visibleDateTasks = allDateTasks.filter((task) => {
            if (!task.completed) return true;
            return Boolean(task.dueDate && task.dueDate > todayStr);
          });
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
              className={`min-h-[110px] sm:min-h-[130px] h-full p-2 sm:p-2.5 flex flex-col justify-start gap-1.5 cursor-pointer transition-all select-none group ${
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
              <div className="flex items-center justify-between mb-0.5">
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

                <div className="flex items-center gap-1">
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
              </div>

              {/* Task Items & Events Preview (Expands to show all items naturally) */}
              <div className="space-y-1 flex-1">
                {visibleDateTasks.map((task) => {
                  const taskInbox = inboxes.find(
                    (i) => i.id === (task.inboxId || 'inbox-general')
                  );
                  const isDueThisDay = task.dueDate === cell.dateStr;
                  const isDueActive = isDueThisDay && !task.completed;
                  return (
                    <div
                      key={task.id}
                      style={
                        isDueActive
                          ? { backgroundColor: taskInbox?.color || '#171717', color: '#ffffff' }
                          : undefined
                      }
                      className={`text-[10px] truncate px-1.5 py-0.5 rounded flex items-center gap-1 border transition-colors ${
                        task.completed
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through'
                          : isDueActive
                          ? 'border-transparent font-medium shadow-2xs'
                          : task.priority === 'high'
                          ? 'bg-red-50 text-red-700 border-red-200/60 font-medium'
                          : 'bg-[#fafafa] text-neutral-800 border-[#ebebeb]'
                      }`}
                    >
                      {/* Little bit of inbox color dot if not full background */}
                      {!isDueActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: taskInbox?.color || '#171717' }}
                        />
                      )}
                      {task.completed ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-neutral-900 flex-shrink-0" />
                      ) : (
                        <Circle className={`w-2.5 h-2.5 flex-shrink-0 ${isDueActive ? 'text-white' : 'text-neutral-400'}`} />
                      )}
                      <span className="truncate">{task.title}</span>
                      {(task.completedParts || 0) > 0 && !task.completed && (
                        <span className={`text-[8px] font-mono font-semibold ml-auto flex-shrink-0 ${isDueActive ? 'text-white/90' : 'text-neutral-500'}`}>
                          {task.completedParts}/4
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Events Preview for this date - Fully colored with inbox color */}
                {events
                  .filter((e) => e.date === cell.dateStr && !e.completed)
                  .map((evt) => {
                    const evtInbox = inboxes.find(
                      (i) => i.id === (evt.inboxId || 'inbox-general')
                    );
                    return (
                      <div
                        key={evt.id}
                        style={{
                          backgroundColor: evtInbox?.color || '#171717',
                          color: '#ffffff',
                        }}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded flex items-center gap-1 border border-transparent text-white font-medium shadow-2xs"
                        title={`${evt.title} (${evt.time || 'All day'}${evt.location ? ` - ${evt.location}` : ''})`}
                      >
                        <Clock className="w-2.5 h-2.5 text-white/90 flex-shrink-0" />
                        {evt.time && <span className="font-mono text-white/90">{evt.time}</span>}
                        <span className="truncate">{evt.title}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
