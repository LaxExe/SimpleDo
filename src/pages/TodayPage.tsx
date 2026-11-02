import React, { useState } from 'react';
import { Task, Habit, InboxGroup, DayPlan, Page } from '../types';
import { storage, getTodayStr, sortTasks } from '../services/storage';
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
  CheckSquare,
  Activity,
  Layers
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

  // Available tasks not yet planned on selected date (sorted active first)
  const availableTasks = sortTasks(
    tasks.filter((t) => !t.completed && !plannedTasks.some((pt) => pt.id === t.id))
  );

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

  const completedPlannedTasks = plannedTasks.filter((t) => t.completed).length;
  const habitsDoneOnDate = plannedHabits.filter((h) => h.completedDates.includes(selectedDate)).length;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Date Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#ebebeb] rounded-md bg-white shadow-2xs overflow-hidden">
            <button
              onClick={handlePrevDay}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#ebebeb]" />
            <button
              onClick={handleNextDay}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-[#fafafa] transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
                {formattedDate}
              </h1>
              {isToday ? (
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#ebf5ff] text-[#0068d6] border border-blue-200/60">
                  Today
                </span>
              ) : (
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 underline"
                >
                  Return to Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Day Stats */}
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-600 bg-white px-3.5 py-1.5 rounded-full border border-[#ebebeb] shadow-subtle w-fit">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>{completedPlannedTasks}/{plannedTasks.length} tasks</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>{habitsDoneOnDate}/{plannedHabits.length} habits</span>
          </span>
        </div>
      </div>

      {/* 2. Hero Section: Today's Plan (High Emphasis) */}
      <div className="space-y-6">
        {/* Quick Add Focus Task Input */}
        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-2.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>What do you want to accomplish {isToday ? 'today' : 'on this day'}?</span>
            </span>
            <span className="text-[11px] font-normal text-neutral-400 font-mono hidden sm:inline">
              Press Enter
            </span>
          </div>

          <form onSubmit={handleAddTaskToDay} className="flex gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Type a task and add it to this day..."
              className="flex-1 px-3.5 py-2 text-sm bg-[#fafafa] border border-[#ebebeb] rounded-lg focus:outline-none focus:border-neutral-900 transition-colors"
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
        </div>

        {/* Planned Tasks & Habits Droppable Grid */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropOver(true);
          }}
          onDragLeave={() => setIsDropOver(false)}
          onDrop={handleDropOnDay}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-1 rounded-xl transition-all ${
            isDropOver ? 'ring-2 ring-primary/40 bg-blue-50/20' : ''
          }`}
        >
          {/* Card A: Planned Tasks for the Day */}
          <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb] mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Planned Tasks
                  </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {completedPlannedTasks}/{plannedTasks.length}
                </span>
              </div>

              {plannedTasks.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-400 border border-dashed border-[#ebebeb] rounded-lg">
                  No tasks planned for this day.
                </div>
              ) : (
                <ul className="divide-y divide-[#ebebeb]/70">
                  {plannedTasks.map((task) => (
                    <li
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'task', task.id)}
                      className="py-2.5 flex items-center justify-between gap-3 group hover:bg-[#fafafa]/80 -mx-2 px-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <GripVertical className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 cursor-grab flex-shrink-0" />
                        <button
                          onClick={() => storage.toggleTask(task.id)}
                          className="flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                          )}
                        </button>
                        <span
                          className={`text-xs font-medium truncate ${
                            task.completed
                              ? 'line-through text-neutral-400'
                              : 'text-neutral-900'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {task.priority === 'high' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-600 font-medium border border-red-200/40">
                            High
                          </span>
                        )}

                        <button
                          onClick={() => handleMoveToTomorrow(task.id)}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 hover:bg-[#ebebeb] px-1.5 py-0.5 rounded transition-colors"
                          title="Move to tomorrow"
                        >
                          → Tomorrow
                        </button>

                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 text-neutral-300 hover:text-neutral-900 rounded transition-colors"
                          title="Edit task"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => storage.removeTaskFromDate(selectedDate, task.id)}
                          className="p-1 text-neutral-300 hover:text-red-500 rounded transition-colors"
                          title="Remove from this day"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Card B: Planned Habits for the Day */}
          <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb] mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Planned Habits
                  </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {habitsDoneOnDate}/{plannedHabits.length}
                </span>
              </div>

              {plannedHabits.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-400 border border-dashed border-[#ebebeb] rounded-lg">
                  No habits planned for this day.
                </div>
              ) : (
                <ul className="divide-y divide-[#ebebeb]/70">
                  {plannedHabits.map((habit) => {
                    const isDone = habit.completedDates.includes(selectedDate);
                    return (
                      <li
                        key={habit.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'habit', habit.id)}
                        className="py-2.5 flex items-center justify-between gap-3 group hover:bg-[#fafafa]/80 -mx-2 px-2 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <GripVertical className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 cursor-grab flex-shrink-0" />
                          <button
                            onClick={() => storage.toggleHabitDate(habit.id, selectedDate)}
                            className="flex-shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                            ) : (
                              <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                            )}
                          </button>
                          <span
                            className={`text-xs font-medium truncate ${
                              isDone ? 'line-through text-neutral-400' : 'text-neutral-900'
                            }`}
                          >
                            {habit.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="flex items-center gap-0.5 text-[11px] font-mono text-neutral-500">
                            <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-neutral-300'}`} />
                            <span>{habit.streak}d</span>
                          </span>
                          <button
                            onClick={() => storage.removeHabitFromDate(selectedDate, habit.id)}
                            className="p-1 text-neutral-300 hover:text-red-500 rounded transition-colors"
                            title="Remove habit from this day"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 3. Available Tray: Drag items into today */}
        {(availableTasks.length > 0 || availableHabits.length > 0) && (
          <div className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 mb-3">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>Available to drag or add to this day</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Tasks */}
              {availableTasks.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    <span>Tasks ({availableTasks.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {availableTasks.slice(0, 10).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'task', task.id)}
                        className="p-1.5 px-2 text-xs bg-[#fafafa] hover:bg-neutral-100 border border-[#ebebeb] rounded-md flex items-center gap-2 cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <GripVertical className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[160px] text-neutral-800">{task.title}</span>
                        <button
                          onClick={() => storage.addTaskToDate(selectedDate, task.id)}
                          className="p-0.5 text-primary hover:bg-[#ebf5ff] rounded"
                          title="Add to day"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Habits */}
              {availableHabits.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Habits ({availableHabits.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {availableHabits.map((habit) => (
                      <div
                        key={habit.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'habit', habit.id)}
                        className="p-1.5 px-2 text-xs bg-[#fafafa] hover:bg-neutral-100 border border-[#ebebeb] rounded-md flex items-center gap-2 cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <GripVertical className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[160px] text-neutral-800">{habit.name}</span>
                        <button
                          onClick={() => storage.addHabitToDate(selectedDate, habit.id)}
                          className="p-0.5 text-primary hover:bg-[#ebf5ff] rounded"
                          title="Add habit to day"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Large Full-Width Calendar Underneath */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
            Schedule & Overview
          </h2>
          <span className="text-xs text-neutral-400">
            Click any day to customize its plan
          </span>
        </div>

        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasks={tasks}
          habits={habits}
          dayPlans={dayPlans}
          onDropTaskOnDate={handleDropOnCalendarDate}
          onDropHabitOnDate={handleDropHabitOnCalendarDate}
        />
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        inboxes={inboxes}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
};
