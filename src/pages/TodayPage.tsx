import React, { useState, useRef } from 'react';
import { Task, Habit, InboxGroup, DayPlan, Page } from '../types';
import { storage, getTodayStr, sortTasksByInbox } from '../services/storage';
import { CalendarView } from '../components/CalendarView';
import { TaskEditModal } from '../components/TaskEditModal';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Flame, 
  GripVertical, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  X,
  Edit2,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TodayPageProps {
  tasks: Task[];
  habits: Habit[];
  inboxes: InboxGroup[];
  dayPlans: Record<string, DayPlan>;
  onNavigate: (page: Page) => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({
  tasks,
  habits,
  inboxes,
  dayPlans,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [taskInput, setTaskInput] = useState('');
  const [isDropOver, setIsDropOver] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const todayStr = getTodayStr();
  const dayPlan = dayPlans[selectedDate] || storage.getDayPlan(selectedDate);

  // Compute tasks for selected date
  const rawPlannedTasks = tasks.filter(
    (t) =>
      dayPlan.plannedTaskIds.includes(t.id) ||
      t.scheduledDate === selectedDate ||
      t.dueDate === selectedDate
  );

  // Sort tasks by inbox: General first (not sorted), others sorted by inbox name matching their color
  const { allOrderedTasks } = sortTasksByInbox(rawPlannedTasks, inboxes);

  // Compute habits for selected date (only habits dragged into this day)
  const plannedHabits = habits.filter((h) => dayPlan.plannedHabitIds.includes(h.id));

  // Available tasks not yet planned on selected date
  const availableTasksRaw = tasks.filter(
    (t) => !t.completed && !rawPlannedTasks.some((pt) => pt.id === t.id)
  );
  const { allOrderedTasks: availableOrderedTasks } = sortTasksByInbox(availableTasksRaw, inboxes);

  // Available habits not yet in this day's plan
  const availableHabits = habits.filter(
    (h) => !plannedHabits.some((ph) => ph.id === h.id)
  );

  const isToday = selectedDate === todayStr;

  // Pretty format date
  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleAddTaskToDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    storage.addTask({
      title: taskInput.trim(),
      completed: false,
      priority: 'medium',
      category: 'Day Plan',
      inboxId: inboxes[0]?.id || 'inbox-general',
      scheduledDate: selectedDate,
      dueDate: selectedDate,
    });

    setTaskInput('');
  };

  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Scroll to the right/left when tasks stack up
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'task' | 'habit', id: string) => {
    e.dataTransfer.setData(`text/plain-${type}`, id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnDay = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropOver(false);

    const taskId = e.dataTransfer.getData('text/plain-task');
    const habitId = e.dataTransfer.getData('text/plain-habit');

    if (taskId) {
      storage.addTaskToDate(selectedDate, taskId);
    } else if (habitId) {
      storage.addHabitToDate(selectedDate, habitId);
    }
  };

  const handleDropOnCalendarDate = (taskId: string, targetDate: string) => {
    storage.moveTaskToDate(taskId, targetDate, selectedDate);
  };

  const handleDropHabitOnCalendarDate = (habitId: string, targetDate: string) => {
    storage.addHabitToDate(targetDate, habitId);
  };

  const handleMoveToTomorrow = (taskId: string) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    const tomorrowStr = d.toISOString().split('T')[0];
    storage.moveTaskToDate(taskId, tomorrowStr, selectedDate);
  };

  const handleRemoveTaskFromDay = (taskId: string) => {
    storage.removeTaskFromDate(selectedDate, taskId);
  };

  const handleRemoveHabitFromDay = (habitId: string) => {
    storage.removeHabitFromDate(selectedDate, habitId);
  };

  const completedPlannedTasks = allOrderedTasks.filter((item) => item.task.completed).length;
  const habitsDoneOnDate = plannedHabits.filter((h) => h.completedDates.includes(selectedDate)).length;
  const hasStackedTasks = allOrderedTasks.length > 2;

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Date Switcher Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] rounded-md border border-[#ebebeb] transition-colors shadow-2xs"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-neutral-500">{formattedDate}</span>
          <button
            onClick={handleNextDay}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] rounded-md border border-[#ebebeb] transition-colors shadow-2xs"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-xs font-mono text-neutral-500 hover:text-neutral-900 underline"
            >
              Return to Today
            </button>
          )}
          <span className="text-xs font-mono text-neutral-600 bg-white px-3 py-1 rounded-full border border-[#ebebeb] shadow-2xs">
            {completedPlannedTasks}/{allOrderedTasks.length} tasks • {habitsDoneOnDate}/{plannedHabits.length} habits
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TOP SECTION: "TODAY" IN LARGE TEXT WITH SCROLLABLE TASKS */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">
              {isToday ? 'Today' : formattedDate.split(',')[0]}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {isToday
                ? 'Your planned tasks and habits for today.'
                : `Viewing planned items for ${formattedDate}.`}
            </p>
          </div>

          {/* Horizontal Scroll Arrows when tasks stack up */}
          {allOrderedTasks.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono text-neutral-400 mr-1">
                {allOrderedTasks.length} {allOrderedTasks.length === 1 ? 'task' : 'tasks'}
              </span>

              {hasStackedTasks && (
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#ebebeb] shadow-2xs">
                  <button
                    onClick={handleScrollLeft}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] rounded transition-colors"
                    title="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleScrollRight}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors shadow-2xs"
                    title="Scroll right to see more stacked tasks"
                  >
                    <span>Scroll</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Large Simple Task List / Horizontal Cards when stacked */}
        {allOrderedTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-8 text-center text-sm text-neutral-400">
            No tasks scheduled for today. Add or drag tasks below in the plan section.
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x"
            style={{ scrollbarWidth: 'thin' }}
          >
            {allOrderedTasks.map(({ task, inbox, isGeneral }) => {
              const inboxColor = inbox?.color || '#0068d6';

              return (
                <div
                  key={task.id}
                  className={`w-[290px] sm:w-[330px] shrink-0 snap-start bg-white rounded-xl border shadow-subtle p-5 flex flex-col justify-between transition-all group ${
                    isGeneral
                      ? 'border-[#ebebeb] hover:border-neutral-400'
                      : 'border-l-4'
                  }`}
                  style={!isGeneral ? { borderLeftColor: inboxColor, borderColor: '#ebebeb' } : undefined}
                >
                  <div className="space-y-3">
                    {/* Inbox Label matching inbox color */}
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border"
                        style={
                          isGeneral
                            ? { backgroundColor: '#f5f5f5', color: '#525252', borderColor: '#e5e5e5' }
                            : {
                                backgroundColor: `${inboxColor}12`,
                                color: inboxColor,
                                borderColor: `${inboxColor}30`,
                              }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: isGeneral ? '#737373' : inboxColor }}
                        />
                        <span>{inbox?.name || 'General Inbox'}</span>
                      </span>

                      {task.priority === 'high' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 font-medium border border-red-200/50">
                          High
                        </span>
                      )}
                    </div>

                    {/* Checkbox and Large Title */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => storage.toggleTask(task.id)}
                        className="mt-0.5 flex-shrink-0 transition-transform active:scale-95"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-neutral-900 fill-neutral-900/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-300 hover:text-neutral-700" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-base sm:text-lg font-medium leading-snug break-words ${
                            task.completed
                              ? 'line-through text-neutral-400'
                              : 'text-neutral-900'
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Effortless Remove */}
                  <div className="mt-4 pt-3 border-t border-[#ebebeb] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveToTomorrow(task.id)}
                        className="text-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded transition-colors"
                        title="Move to tomorrow"
                      >
                        → Tomorrow
                      </button>
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Effortless Remove Button */}
                    <button
                      onClick={() => handleRemoveTaskFromDay(task.id)}
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors font-medium"
                      title="Remove task from today"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Planned Habits Row for Today */}
        {plannedHabits.length > 0 && (
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3">
            <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-neutral-900" />
              <span>Habits for today</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {plannedHabits.map((habit) => {
                const isDone = habit.completedDates.includes(selectedDate);
                return (
                  <div
                    key={habit.id}
                    className="p-3.5 bg-[#fafafa] rounded-lg border border-[#ebebeb] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => storage.toggleHabitDate(habit.id, selectedDate)}
                        className="flex-shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-neutral-900 fill-neutral-900/10" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-700" />
                        )}
                      </button>
                      <span
                        className={`text-sm font-medium truncate ${
                          isDone ? 'line-through text-neutral-400' : 'text-neutral-900'
                        }`}
                      >
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex items-center gap-0.5 text-xs font-mono text-neutral-500">
                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span>{habit.streak}d</span>
                      </span>
                      <button
                        onClick={() => handleRemoveHabitFromDay(habit.id)}
                        className="p-1 text-neutral-300 hover:text-red-600 rounded transition-colors"
                        title="Remove habit from today"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. PLAN SECTION: ADD, DRAG, & CUSTOMIZE CHANGES */}
      {/* ======================================================== */}
      <section className="space-y-5 pt-4 border-t border-[#ebebeb]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-900" />
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Plan
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Add or drag tasks into your day
          </span>
        </div>

        {/* Quick Add Focus Task Form */}
        <form onSubmit={handleAddTaskToDay} className="flex gap-2">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Plan a new task for today..."
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-[#ebebeb] rounded-lg focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
          />
          <button
            type="submit"
            disabled={!taskInput.trim()}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Droppable Drop Zone & Available Pools */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropOver(true);
          }}
          onDragLeave={() => setIsDropOver(false)}
          onDrop={handleDropOnDay}
          className={`bg-white rounded-xl border p-5 shadow-subtle space-y-4 transition-all ${
            isDropOver ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/50' : 'border-[#ebebeb]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[#ebebeb]">
            <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-900" />
              <span>Available Tasks & Habits to Drag into Today</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Drag or click + to add
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available Tasks (Sorted by inbox with matching colors) */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-neutral-500 flex items-center justify-between">
                <span>Tasks ({availableOrderedTasks.length})</span>
              </div>

              {availableOrderedTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400 border border-dashed border-[#ebebeb] rounded-lg">
                  All active tasks are planned.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {availableOrderedTasks.map(({ task, inbox, isGeneral }) => {
                    const color = inbox?.color || '#0068d6';
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'task', task.id)}
                        className={`p-2 text-xs bg-[#fafafa] hover:bg-neutral-100 border rounded-md flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-colors ${
                          !isGeneral ? 'border-l-2' : 'border-[#ebebeb]'
                        }`}
                        style={!isGeneral ? { borderLeftColor: color, borderColor: '#ebebeb' } : undefined}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                          <span className="truncate text-neutral-800">{task.title}</span>
                          {!isGeneral && (
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0"
                              style={{ backgroundColor: `${color}15`, color }}
                            >
                              {inbox?.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => storage.addTaskToDate(selectedDate, task.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-neutral-900 hover:bg-neutral-200/70 rounded transition-colors"
                          title="Add to today"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Available Habits */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-neutral-500 flex items-center justify-between">
                <span>Habits ({availableHabits.length})</span>
              </div>

              {availableHabits.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400 border border-dashed border-[#ebebeb] rounded-lg">
                  All habits are planned for this day.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {availableHabits.map((habit) => (
                    <div
                      key={habit.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'habit', habit.id)}
                      className="p-2 text-xs bg-[#fafafa] hover:bg-neutral-100 border border-[#ebebeb] rounded-md flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span className="truncate text-neutral-800">{habit.name}</span>
                      </div>
                      <button
                        onClick={() => storage.addHabitToDate(selectedDate, habit.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-neutral-900 hover:bg-neutral-200/70 rounded transition-colors"
                        title="Add habit to today"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CALENDAR SECTION: LARGE FULL-WIDTH CALENDAR */}
      {/* ======================================================== */}
      <section className="space-y-4 pt-4 border-t border-[#ebebeb]">
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasks={tasks}
          habits={habits}
          dayPlans={dayPlans}
          onDropTaskOnDate={handleDropOnCalendarDate}
          onDropHabitOnDate={handleDropHabitOnCalendarDate}
        />
      </section>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        inboxes={inboxes}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
};
