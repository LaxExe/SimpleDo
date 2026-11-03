import React, { useState, useRef } from 'react';
import { Task, Habit, InboxGroup, DayPlan, Page, InboxEvent } from '../types';
import { storage, getTodayStr, sortTasks } from '../services/storage';
import { CalendarView } from '../components/CalendarView';
import { TaskEditModal } from '../components/TaskEditModal';
import { 
  Plus, 
  Flame, 
  GripVertical, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  X, 
  Edit2, 
  Layers,
  Check,
  Clock,
  MapPin,
  Calendar as CalendarIcon
} from 'lucide-react';

interface TodayPageProps {
  tasks: Task[];
  events?: InboxEvent[];
  habits: Habit[];
  inboxes: InboxGroup[];
  dayPlans: Record<string, DayPlan>;
  onNavigate: (page: Page) => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({
  tasks,
  events = [],
  habits,
  inboxes,
  dayPlans,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [taskInput, setTaskInput] = useState('');
  const [isDropOver, setIsDropOver] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Ref for the horizontal scrolling available tasks/habits shelf
  const planPoolScrollRef = useRef<HTMLDivElement>(null);

  const scrollPlanPoolLeft = () => {
    planPoolScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollPlanPoolRight = () => {
    planPoolScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const todayStr = getTodayStr();
  const dayPlan = dayPlans[selectedDate] || storage.getDayPlan(selectedDate);

  // Compute tasks for selected date & sort so active tasks appear first
  const rawPlannedTasks = tasks.filter(
    (t) =>
      dayPlan.plannedTaskIds.includes(t.id) ||
      t.scheduledDate === selectedDate ||
      t.dueDate === selectedDate
  );
  const plannedTasks = sortTasks(rawPlannedTasks);

  // Compute habits for selected date (only habits dragged into this day)
  const plannedHabits = habits.filter((h) => dayPlan.plannedHabitIds.includes(h.id));

  // Compute events for selected date (sitting below tasks, not assignable to plan mode)
  const selectedDateEvents = events.filter((e) => e.date === selectedDate);

  // Available tasks not yet planned on selected date (sorted active first)
  const availableTasks = sortTasks(
    tasks.filter((t) => !t.completed && !plannedTasks.some((pt) => pt.id === t.id))
  );

  // Group available tasks by inbox
  const tasksByInbox: { inbox: InboxGroup; tasks: Task[] }[] = inboxes.map((inbox) => ({
    inbox,
    tasks: availableTasks.filter((t) => (t.inboxId || 'inbox-general') === inbox.id),
  }));

  // Tasks that don't match any existing inbox
  const unassignedTasks = availableTasks.filter(
    (t) => !inboxes.some((i) => i.id === (t.inboxId || 'inbox-general'))
  );
  if (unassignedTasks.length > 0) {
    tasksByInbox.push({
      inbox: {
        id: 'inbox-other',
        name: 'Other Tasks',
        color: '#737373',
        createdAt: new Date().toISOString(),
      },
      tasks: unassignedTasks,
    });
  }

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

  const completedPlannedTasks = plannedTasks.filter((t) => t.completed).length;
  const habitsDoneOnDate = plannedHabits.filter((h) => h.completedDates.includes(selectedDate)).length;

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
            {completedPlannedTasks}/{plannedTasks.length} tasks • {habitsDoneOnDate}/{plannedHabits.length} habits
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TOP SECTION: LARGE TEXT "TODAY" LISTING TASKS */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">
              {isToday ? 'Today' : formattedDate.split(',')[0]}
            </h1>
            <span className="text-xs font-mono text-neutral-400">
              {plannedTasks.length} {plannedTasks.length === 1 ? 'task' : 'tasks'} for today
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {isToday
              ? 'Your active tasks and habits for today. Check them off as you complete them.'
              : `Viewing scheduled items for ${formattedDate}.`}
          </p>
        </div>

        {/* Large Simple Task List */}
        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle divide-y divide-[#ebebeb] overflow-hidden">
          {plannedTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No tasks scheduled for today. Add or drag tasks below in the plan section.
            </div>
          ) : (
            plannedTasks.map((task) => {
              const taskInbox = inboxes.find(
                (i) => i.id === (task.inboxId || 'inbox-general')
              );
              return (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#fafafa]/70 transition-colors group relative"
                  style={{
                    borderLeft: `4px solid ${taskInbox?.color || '#171717'}`,
                  }}
                >
                  {/* Large Checkbox & Large Task Title */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pl-1">
                    <button
                      onClick={() => storage.toggleTask(task.id)}
                      className="flex-shrink-0 transition-transform active:scale-95"
                    >
                      {task.completed ? (
                        <div className="w-5 h-5 rounded-full bg-neutral-200 border-2 border-neutral-900 flex items-center justify-center">
                          <Check className="w-3 h-3 text-neutral-900 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-300 hover:border-neutral-900 transition-colors" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-base sm:text-lg font-medium leading-snug truncate ${
                          task.completed
                            ? 'line-through text-neutral-400'
                            : 'text-neutral-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: taskInbox?.color || '#171717' }}
                        />
                        <span className="text-xs font-mono text-neutral-400">
                          {taskInbox?.name || task.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Badges & Effortless Remove Action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.priority === 'high' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 font-medium border border-red-200/50">
                      High
                    </span>
                  )}

                  <button
                    onClick={() => handleMoveToTomorrow(task.id)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded transition-colors hidden sm:inline-flex"
                    title="Move to tomorrow"
                  >
                    → Tomorrow
                  </button>

                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Clear, easy remove button */}
                  <button
                    onClick={() => handleRemoveTaskFromDay(task.id)}
                    className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    title="Remove from today"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            );
          })
        )}

          {/* Planned Habits Row for Today */}
          {plannedHabits.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#fafafa]/50 border-t border-[#ebebeb] space-y-2.5">
              <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-neutral-900" />
                <span>Habits for today</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {plannedHabits.map((habit) => {
                  const isDone = habit.completedDates.includes(selectedDate);
                  return (
                    <div
                      key={habit.id}
                      className="p-3 bg-white rounded-lg border border-[#ebebeb] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => storage.toggleHabitDate(habit.id, selectedDate)}
                          className="flex-shrink-0"
                        >
                          {isDone ? (
                            <div className="w-4 h-4 rounded-full bg-neutral-200 border-2 border-neutral-900 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-neutral-900 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-neutral-300 hover:border-neutral-900 transition-colors" />
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
                          <Flame className="w-3.5 h-3.5 fill-neutral-700 text-neutral-700" />
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

          {/* Events for Today / Selected Date (sitting below tasks) */}
          {selectedDateEvents.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#ebebeb] space-y-2.5">
              <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-neutral-900" />
                  <span>Events</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                    {selectedDateEvents.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedDateEvents.map((evt) => {
                  const inboxInfo = inboxes.find((i) => i.id === evt.inboxId);
                  return (
                    <div
                      key={evt.id}
                      className="p-3 bg-[#fafafa] rounded-lg border border-[#ebebeb] flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: inboxInfo?.color || '#171717' }}
                          />
                          <span className="text-xs font-semibold text-neutral-900 truncate">
                            {evt.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                          {evt.time && (
                            <span className="flex items-center gap-1 text-neutral-800 font-medium">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{evt.time}</span>
                            </span>
                          )}
                          {evt.location && (
                            <span className="flex items-center gap-1 text-neutral-600 truncate">
                              <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. PLAN SECTION: ADD, DRAG, & HORIZONTAL SCROLL BY INBOX */}
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

        {/* Available Tasks & Habits Shelf: Sorted by Inbox with Horizontal Scroll & Arrows */}
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
          {/* Header with Horizontal Scroll Arrows */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[#ebebeb]">
            <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-900" />
              <span>Available Tasks & Habits to Drag into Today</span>
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-neutral-400 mr-1 hidden sm:inline">
                Scroll right for more
              </span>
              <button
                type="button"
                onClick={scrollPlanPoolLeft}
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded border border-[#ebebeb] transition-colors"
                title="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={scrollPlanPoolRight}
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded border border-[#ebebeb] transition-colors"
                title="Scroll right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Card Track (Sorted by Inbox with Matching Color) */}
          <div
            ref={planPoolScrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth py-1 px-0.5 no-scrollbar items-start"
          >
            {/* 1. Inbox Groups (sorted by inbox, matching inbox color) */}
            {tasksByInbox.map(({ inbox, tasks: inboxTasks }) => (
              <div
                key={inbox.id}
                className="w-64 flex-shrink-0 bg-[#fafafa] rounded-lg border border-[#ebebeb] p-3 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-[#ebebeb]/80">
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs"
                      style={{ backgroundColor: inbox.color || '#171717' }}
                    />
                    <span className="text-xs font-semibold text-neutral-900 truncate">
                      {inbox.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                    {inboxTasks.length}
                  </span>
                </div>

                {inboxTasks.length === 0 ? (
                  <div className="py-5 text-center text-xs text-neutral-400">
                    No active tasks
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                    {inboxTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'task', task.id)}
                        style={{ borderLeftColor: inbox.color || '#171717', borderLeftWidth: '3px' }}
                        className="p-2 text-xs bg-white hover:bg-neutral-50 border border-[#ebebeb] rounded-md flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <GripVertical className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                          <span className="truncate text-neutral-900 font-medium">
                            {task.title}
                          </span>
                        </div>
                        <button
                          onClick={() => storage.addTaskToDate(selectedDate, task.id)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-neutral-900 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
                          title="Add to today"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 2. Habits Group Column */}
            <div className="w-64 flex-shrink-0 bg-[#fafafa] rounded-lg border border-[#ebebeb] p-3 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#ebebeb]/80">
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <Flame className="w-3 h-3 text-neutral-900" />
                  <span className="text-xs font-semibold text-neutral-900 truncate">
                    Habits
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                  {availableHabits.length}
                </span>
              </div>

              {availableHabits.length === 0 ? (
                <div className="py-5 text-center text-xs text-neutral-400">
                  All habits planned
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                  {availableHabits.map((habit) => (
                    <div
                      key={habit.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'habit', habit.id)}
                      className="p-2 text-xs bg-white hover:bg-neutral-50 border border-[#ebebeb] rounded-md flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span className="truncate text-neutral-900 font-medium">
                          {habit.name}
                        </span>
                      </div>
                      <button
                        onClick={() => storage.addHabitToDate(selectedDate, habit.id)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-neutral-900 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
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
          events={events}
          inboxes={inboxes}
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
