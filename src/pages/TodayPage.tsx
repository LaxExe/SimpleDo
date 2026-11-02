import React, { useState } from 'react';
import { Task, Habit, InboxGroup, Page } from '../types';
import { storage, getTodayStr } from '../services/storage';
import { CalendarView } from '../components/CalendarView';
import { TaskEditModal } from '../components/TaskEditModal';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Flame, 
  GripVertical, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Sparkles,
  X,
  Edit2
} from 'lucide-react';

interface TodayPageProps {
  tasks: Task[];
  habits: Habit[];
  inboxes: InboxGroup[];
  onNavigate: (page: Page) => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({
  tasks,
  habits,
  inboxes,
  onNavigate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [taskInput, setTaskInput] = useState('');
  const [isDropOver, setIsDropOver] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = getTodayStr();
  const dayPlan = storage.getDayPlan(selectedDate);

  // Compute tasks for selected date
  const plannedTasks = tasks.filter(
    (t) =>
      dayPlan.plannedTaskIds.includes(t.id) ||
      t.scheduledDate === selectedDate ||
      t.dueDate === selectedDate
  );

  // Compute habits for selected date (only habits dragged into this day!)
  const plannedHabits = habits.filter((h) => dayPlan.plannedHabitIds.includes(h.id));

  // Available tasks not yet planned on selected date
  const availableTasks = tasks.filter(
    (t) => !t.completed && !plannedTasks.some((pt) => pt.id === t.id)
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
    <div className="space-y-8 animate-fadeIn">
      {/* Date Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevDay}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full border border-[#ebebeb] transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

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
                  className="text-[10px] font-mono text-neutral-500 hover:text-neutral-900 underline"
                >
                  Return to Today
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Customize and organize tasks and habits scheduled for this day.
            </p>
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full border border-[#ebebeb] transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Day Stats */}
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-600 bg-white px-3 py-1.5 rounded-full border border-[#ebebeb] shadow-subtle w-fit">
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

      {/* Main Grid: Day Planner Column & Calendar + Resource Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): The Interactive Day Planner */}
        <div className="lg:col-span-7 space-y-6">
          {/* Write Out Today's Tasks Input */}
          <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Write what you want to get done for {isToday ? 'today' : 'this day'}</span>
              </span>
              <span className="text-[11px] font-normal text-neutral-400 font-mono">
                Press Enter to add
              </span>
            </div>

            <form onSubmit={handleAddTaskToDay} className="flex gap-2">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="e.g. Finish project proposal, call mom, read 1 chapter..."
                className="flex-1 px-3 py-2 text-sm bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
              />
              <button
                type="submit"
                disabled={!taskInput.trim()}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 disabled:opacity-40 transition-colors inline-flex items-center gap-1 shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Droppable Day Plan Container */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDropOver(true);
            }}
            onDragLeave={() => setIsDropOver(false)}
            onDrop={handleDropOnDay}
            className={`bg-white rounded-lg border transition-all duration-150 p-5 shadow-subtle ${
              isDropOver
                ? 'border-primary ring-2 ring-primary/20 bg-blue-50/20'
                : 'border-[#ebebeb]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb] mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-700" />
                <h2 className="text-sm font-semibold text-neutral-900">
                  Planned for this day
                </h2>
              </div>
              <span className="text-xs text-neutral-400">
                Drag tasks or habits here
              </span>
            </div>

            {/* Section A: Planned Tasks */}
            <div className="space-y-2 mb-6">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                <span>Tasks ({plannedTasks.length})</span>
              </div>

              {plannedTasks.length === 0 ? (
                <div className="py-6 border-2 border-dashed border-[#ebebeb] rounded-lg text-center">
                  <p className="text-xs text-neutral-500">No tasks planned yet.</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Write above, or drag in tasks from the pool on the right.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#ebebeb]/70">
                  {plannedTasks.map((task) => (
                    <li
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'task', task.id)}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-[#fafafa]/80 -mx-2 px-2 rounded-md transition-colors"
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
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 hover:bg-[#ebebeb] px-2 py-0.5 rounded transition-colors"
                          title="Move task to tomorrow"
                        >
                          → Tomorrow
                        </button>

                        {/* Edit task button */}
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 text-neutral-300 hover:text-neutral-900 rounded transition-colors"
                          title="Edit task details"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => storage.removeTaskFromDate(selectedDate, task.id)}
                          className="p-1 text-neutral-300 hover:text-red-500 rounded transition-colors"
                          title="Unschedule from this day"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section B: Planned Habits (Only dragged-in habits count toward streak!) */}
            <div className="space-y-2 pt-4 border-t border-[#ebebeb]">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                <span>Habits Dragged In ({plannedHabits.length})</span>
                <span className="text-[10px] text-neutral-400 font-normal lowercase">
                  (only dragged-in habits affect streaks)
                </span>
              </div>

              {plannedHabits.length === 0 ? (
                <div className="py-5 border-2 border-dashed border-[#ebebeb] rounded-lg text-center">
                  <p className="text-xs text-neutral-500">No habits dragged in for this day.</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Drag habits from the available pool on the right to track them without losing streaks on skipped days.
                  </p>
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
                        className="py-3 flex items-center justify-between gap-3 group hover:bg-[#fafafa]/80 -mx-2 px-2 rounded-md transition-colors"
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
                            <span>{habit.streak}d streak</span>
                          </span>
                          <button
                            onClick={() => storage.removeHabitFromDate(selectedDate, habit.id)}
                            className="p-1 text-neutral-300 hover:text-red-500 rounded transition-colors"
                            title="Remove habit from this day (won't penalize streak)"
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

        {/* Right Column (5 cols): Interactive Calendar + Drag Pool */}
        <div className="lg:col-span-5 space-y-6">
          {/* Calendar Widget */}
          <CalendarView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            tasks={tasks}
            habits={habits}
            onDropTaskOnDate={handleDropOnCalendarDate}
            onDropHabitOnDate={handleDropHabitOnCalendarDate}
          />

          {/* Draggable Pool: Available Tasks */}
          <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle p-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#ebebeb] mb-3">
              <span className="text-xs font-semibold text-neutral-900">
                Available Tasks to Drag In
              </span>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
              >
                All tasks <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {availableTasks.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3 text-center">
                All active tasks are planned!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {availableTasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'task', task.id)}
                    className="p-2 text-xs bg-[#fafafa] hover:bg-neutral-100 border border-[#ebebeb] rounded-md flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GripVertical className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="truncate text-neutral-800">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                        title="Edit task"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => storage.addTaskToDate(selectedDate, task.id)}
                        className="p-1 text-primary hover:bg-[#ebf5ff] rounded transition-colors"
                        title="Add to selected day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Draggable Pool: Available Habits */}
          {availableHabits.length > 0 && (
            <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle p-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#ebebeb] mb-3">
                <span className="text-xs font-semibold text-neutral-900">
                  Available Habits to Drag In
                </span>
                <button
                  onClick={() => onNavigate('tracker')}
                  className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                >
                  Tracker <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {availableHabits.map((habit) => (
                  <div
                    key={habit.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'habit', habit.id)}
                    className="p-2 text-xs bg-[#fafafa] hover:bg-neutral-100 border border-[#ebebeb] rounded-md flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GripVertical className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="truncate text-neutral-800">{habit.name}</span>
                    </div>
                    <button
                      onClick={() => storage.addHabitToDate(selectedDate, habit.id)}
                      className="p-1 text-primary hover:bg-[#ebf5ff] rounded transition-colors flex-shrink-0"
                      title="Add to selected day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
