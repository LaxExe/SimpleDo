import React, { useState } from 'react';
import { Task, InboxGroup, Priority, InboxEvent } from '../types';
import { storage, getTodayStr, PRESET_INBOX_COLORS, sortTasks } from '../services/storage';
import { TaskEditModal } from '../components/TaskEditModal';
import { EventEditModal } from '../components/EventEditModal';
import { 
  Inbox, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  FolderPlus, 
  Layers, 
  Sun, 
  Edit2, 
  Check, 
  GripVertical, 
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  Archive
} from 'lucide-react';

interface InboxPageProps {
  tasks: Task[];
  events?: InboxEvent[];
  inboxes: InboxGroup[];
}

export const InboxPage: React.FC<InboxPageProps> = ({ tasks, events = [], inboxes }) => {
  const [selectedInboxId, setSelectedInboxId] = useState<string>('all');
  
  // Create mode: task vs event
  const [createType, setCreateType] = useState<'task' | 'event'>('task');

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(getTodayStr());
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Modals state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<InboxEvent | null>(null);

  // Archive accordion state (collapsed by default)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // New Inbox creation
  const [isCreatingInbox, setIsCreatingInbox] = useState(false);
  const [newInboxName, setNewInboxName] = useState('');
  const [newInboxDesc, setNewInboxDesc] = useState('');
  const [newInboxColor, setNewInboxColor] = useState(PRESET_INBOX_COLORS[0]);

  // Edit Inbox modal/state
  const [editingInbox, setEditingInbox] = useState<InboxGroup | null>(null);
  const [editInboxName, setEditInboxName] = useState('');
  const [editInboxDesc, setEditInboxDesc] = useState('');
  const [editInboxColor, setEditInboxColor] = useState('');

  // Inbox reordering state
  const [draggedInboxIndex, setDraggedInboxIndex] = useState<number | null>(null);
  const [dragOverInboxIndex, setDragOverInboxIndex] = useState<number | null>(null);

  const handleMoveInbox = (fromIndex: number, toIndex: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (toIndex < 0 || toIndex >= inboxes.length || fromIndex === toIndex) return;
    const updated = [...inboxes];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    storage.reorderInboxes(updated);
  };

  const handleInboxDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', `inbox-reorder:${index}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedInboxIndex(index);
  };

  const handleInboxDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedInboxIndex !== null && draggedInboxIndex !== index) {
      setDragOverInboxIndex(index);
    }
  };

  const handleInboxDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data && data.startsWith('inbox-reorder:')) {
      const sourceIndex = parseInt(data.replace('inbox-reorder:', ''), 10);
      if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
        handleMoveInbox(sourceIndex, targetIndex);
      }
    }
    setDraggedInboxIndex(null);
    setDragOverInboxIndex(null);
  };

  const handleInboxDragEnd = () => {
    setDraggedInboxIndex(null);
    setDragOverInboxIndex(null);
  };

  const todayStr = getTodayStr();
  const todayPlan = storage.getDayPlan(todayStr);

  const isPlannedForToday = (task: Task) => {
    return task.scheduledDate === todayStr || todayPlan.plannedTaskIds.includes(task.id);
  };

  const handleToggleToday = (taskId: string, isCurrentlyPlanned: boolean) => {
    if (isCurrentlyPlanned) {
      storage.removeTaskFromDate(todayStr, taskId);
    } else {
      storage.addTaskToDate(todayStr, taskId);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetInboxId =
      selectedInboxId === 'all' ? (inboxes[0]?.id || 'inbox-general') : selectedInboxId;

    const targetInbox = inboxes.find((i) => i.id === targetInboxId);

    storage.addTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      inboxId: targetInboxId,
      category: targetInbox?.name || 'Inbox',
      dueDate: newTaskDueDate || undefined,
    });

    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const handleCreateInbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInboxName.trim()) return;

    const created = storage.addInbox(newInboxName, newInboxDesc, newInboxColor);
    setSelectedInboxId(created.id);
    setNewInboxName('');
    setNewInboxDesc('');
    setIsCreatingInbox(false);
  };

  const startEditInbox = (inbox: InboxGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingInbox(inbox);
    setEditInboxName(inbox.name);
    setEditInboxDesc(inbox.description || '');
    setEditInboxColor(inbox.color || PRESET_INBOX_COLORS[0]);
  };

  const handleSaveInboxEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInbox || !editInboxName.trim()) return;

    storage.updateInbox(editingInbox.id, {
      name: editInboxName.trim(),
      description: editInboxDesc.trim(),
      color: editInboxColor,
    });

    setEditingInbox(null);
  };

  // Filter tasks based on selected inbox, and sort so active tasks appear first
  const rawFilteredTasks = tasks.filter((t) => {
    if (selectedInboxId === 'all') return true;
    return (t.inboxId || 'inbox-general') === selectedInboxId;
  });

  const filteredTasks = sortTasks(rawFilteredTasks);
  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  // Filter events based on selected inbox
  const filteredEvents = events.filter((e) => {
    if (selectedInboxId === 'all') return true;
    return (e.inboxId || 'inbox-general') === selectedInboxId;
  });
  const activeEvents = filteredEvents.filter((e) => !e.completed);
  const completedEvents = filteredEvents.filter((e) => e.completed);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    const targetInboxId =
      selectedInboxId === 'all' ? inboxes[0]?.id || 'inbox-general' : selectedInboxId;

    storage.addEvent({
      title: newEventTitle.trim(),
      inboxId: targetInboxId,
      date: newEventDate,
      time: newEventTime.trim() || undefined,
      location: newEventLocation.trim() || undefined,
      description: newEventDesc.trim() || undefined,
    });

    setNewEventTitle('');
    setNewEventTime('');
    setNewEventLocation('');
    setNewEventDesc('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Inbox Hub
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your inboxes, customize colors, and organize tasks.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingInbox(!isCreatingInbox)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-[#ebebeb] rounded-full transition-colors shadow-subtle self-start sm:self-auto"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>{isCreatingInbox ? 'Cancel' : 'New Inbox'}</span>
        </button>
      </div>

      {/* New Inbox Creation Form */}
      {isCreatingInbox && (
        <form
          onSubmit={handleCreateInbox}
          className="bg-white p-5 rounded-lg border border-[#ebebeb] shadow-subtle space-y-4 animate-scaleIn"
        >
          <div className="text-xs font-semibold text-neutral-900">Create New Inbox</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newInboxName}
              onChange={(e) => setNewInboxName(e.target.value)}
              placeholder="Inbox name (e.g. Side Projects, Reading List...)"
              autoFocus
              className="px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
            />
            <input
              type="text"
              value={newInboxDesc}
              onChange={(e) => setNewInboxDesc(e.target.value)}
              placeholder="Description (optional)"
              className="px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Color Customizer Swatches */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Choose Color Theme
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_INBOX_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setNewInboxColor(color)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    newInboxColor === color ? 'ring-2 ring-offset-2 ring-neutral-900 scale-105' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {newInboxColor === color && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
              <input
                type="color"
                value={newInboxColor}
                onChange={(e) => setNewInboxColor(e.target.value)}
                className="w-7 h-7 rounded border border-[#ebebeb] cursor-pointer ml-1 p-0.5 bg-white"
                title="Custom Hex Color"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#ebebeb]">
            <button
              type="button"
              onClick={() => setIsCreatingInbox(false)}
              className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newInboxName.trim()}
              className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40 shadow-subtle"
            >
              Save Inbox
            </button>
          </div>
        </form>
      )}

      {/* Edit Inbox Modal */}
      {editingInbox && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveInboxEdit}
            className="bg-white rounded-xl border border-[#ebebeb] shadow-modal max-w-md w-full p-5 space-y-4"
          >
            <div className="text-sm font-semibold text-neutral-900">
              Customize Inbox: {editingInbox.name}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Inbox Name
              </label>
              <input
                type="text"
                value={editInboxName}
                onChange={(e) => setEditInboxName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={editInboxDesc}
                onChange={(e) => setEditInboxDesc(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Color Customizer */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Customize Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_INBOX_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setEditInboxColor(color)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                      editInboxColor === color ? 'ring-2 ring-offset-2 ring-neutral-900 scale-105' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {editInboxColor === color && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={editInboxColor}
                  onChange={(e) => setEditInboxColor(e.target.value)}
                  className="w-7 h-7 rounded border border-[#ebebeb] cursor-pointer ml-1 p-0.5 bg-white"
                  title="Custom Hex Color"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ebebeb]">
              <button
                type="button"
                onClick={() => setEditingInbox(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editInboxName.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40 shadow-subtle"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Layout: Inbox Tabs/Sidebar + Tasks under selected inbox */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inbox List (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <div className="px-1 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Your Inboxes
            </span>
          </div>

          <button
            onClick={() => setSelectedInboxId('all')}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all ${
              selectedInboxId === 'all'
                ? 'bg-neutral-900 text-white border-neutral-900 font-medium shadow-sm'
                : 'bg-white hover:bg-[#fafafa] text-neutral-800 border-[#ebebeb]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>All Inboxes</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                selectedInboxId === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {tasks.length}
            </span>
          </button>

          {inboxes.map((inbox, index) => {
            const inboxTasks = tasks.filter((t) => (t.inboxId || 'inbox-general') === inbox.id);
            const isSelected = selectedInboxId === inbox.id;
            const isDragging = draggedInboxIndex === index;
            const isDragOver = dragOverInboxIndex === index;

            return (
              <div
                key={inbox.id}
                draggable
                onDragStart={(e) => handleInboxDragStart(e, index)}
                onDragOver={(e) => handleInboxDragOver(e, index)}
                onDrop={(e) => handleInboxDrop(e, index)}
                onDragEnd={handleInboxDragEnd}
                onClick={() => setSelectedInboxId(inbox.id)}
                className={`group cursor-pointer flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 font-medium shadow-sm'
                    : 'bg-white hover:bg-[#fafafa] text-neutral-800 border-[#ebebeb]'
                } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${
                  isDragOver ? 'ring-2 ring-neutral-400 border-neutral-400' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  {/* Drag Handle */}
                  <span
                    className={`cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors ${
                      isSelected
                        ? 'text-white/40 hover:text-white'
                        : 'text-neutral-300 hover:text-neutral-600'
                    }`}
                    title="Drag to rearrange order"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </span>

                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: inbox.color || '#171717' }}
                  />
                  <div className="truncate">
                    <p className="truncate font-medium">{inbox.name}</p>
                    {inbox.description && (
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-white/70' : 'text-neutral-400'
                        }`}
                      >
                        {inbox.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono mr-0.5 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {inboxTasks.length}
                  </span>

                  {/* Customize Color / Edit Inbox */}
                  <button
                    onClick={(e) => startEditInbox(inbox, e)}
                    className={`p-1 rounded transition-opacity ${
                      isSelected ? 'text-white/70 hover:text-white' : 'text-neutral-400 hover:text-neutral-900 opacity-0 group-hover:opacity-100'
                    }`}
                    title="Customize inbox color and name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Allow deleting non-default inboxes */}
                  {inbox.id !== 'inbox-general' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete inbox "${inbox.name}"? Tasks will move to General Inbox.`)) {
                          storage.deleteInbox(inbox.id);
                          if (selectedInboxId === inbox.id) {
                            setSelectedInboxId('all');
                          }
                        }
                      }}
                      className={`p-1 rounded transition-opacity ${
                        isSelected ? 'text-white/70 hover:text-red-300' : 'text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Delete inbox"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Add Tasks Under Selected Inbox & List (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          {/* Add Task / Event Directly Under this Inbox */}
          <form
            onSubmit={createType === 'task' ? handleAddTask : handleAddEvent}
            className="bg-white p-3.5 rounded-lg border border-[#ebebeb] shadow-subtle space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <span>Add {createType === 'task' ? 'task' : 'event'} under</span>
                <span className="font-bold flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      backgroundColor:
                        selectedInboxId === 'all'
                          ? inboxes[0]?.color || '#171717'
                          : inboxes.find((i) => i.id === selectedInboxId)?.color || '#171717',
                    }}
                  />
                  <span>
                    {selectedInboxId === 'all'
                      ? inboxes[0]?.name || 'General Inbox'
                      : inboxes.find((i) => i.id === selectedInboxId)?.name}
                  </span>
                </span>
              </span>

              {/* Toggle Task vs Event */}
              <div className="flex items-center bg-[#ebebeb]/70 p-0.5 rounded-md border border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => setCreateType('task')}
                  className={`px-2.5 py-0.5 text-xs font-medium rounded transition-all ${
                    createType === 'task'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Task
                </button>
                <button
                  type="button"
                  onClick={() => setCreateType('event')}
                  className={`px-2.5 py-0.5 text-xs font-medium rounded transition-all ${
                    createType === 'event'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Event
                </button>
              </div>
            </div>

            {createType === 'task' ? (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What task needs to be captured?"
                    className="flex-1 px-3 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40 flex items-center gap-1 shadow-subtle flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1">
                  <div className="flex items-center gap-1">
                    <span>Priority:</span>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                      className="bg-[#fafafa] border border-[#ebebeb] rounded px-1.5 py-0.5 text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>Due:</span>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="bg-[#fafafa] border border-[#ebebeb] rounded px-1.5 py-0.5 text-xs"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Event or meeting title..."
                    className="flex-1 px-3 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!newEventTitle.trim() || !newEventDate}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40 flex items-center gap-1 shadow-subtle flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Event</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-500 pt-0.5">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-0.5 text-xs"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      placeholder="Time (e.g. 14:00)"
                      className="w-full bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-0.5 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      placeholder="Location (e.g. Zoom)"
                      className="w-full bg-[#fafafa] border border-[#ebebeb] rounded px-2 py-0.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Tasks List (only active tasks shown here) */}
          <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle overflow-hidden">
            <div className="p-3.5 bg-[#fafafa] border-b border-[#ebebeb] flex items-center justify-between text-xs text-neutral-600 font-medium">
              <span>Tasks ({activeTasks.length})</span>
            </div>

            {activeTasks.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-neutral-700">No active tasks in this inbox</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Type above to add tasks directly into this inbox.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#ebebeb]/70">
                {activeTasks.map((task) => {
                  const inboxInfo = inboxes.find((i) => i.id === task.inboxId);
                  const plannedToday = isPlannedForToday(task);

                  return (
                    <li
                      key={task.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => storage.toggleTask(task.id)}
                          className="flex-shrink-0"
                          title="Complete task"
                        >
                          <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate text-neutral-900">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                            {inboxInfo && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: inboxInfo.color || '#171717' }}
                                />
                                {inboxInfo.name}
                              </span>
                            )}
                            {task.dueDate && (
                              <span>Due {task.dueDate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {task.priority === 'high' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-600 font-medium border border-red-200/50">
                            High
                          </span>
                        )}

                        {/* Today Button: Green Checkmark when added to today, Sun when not */}
                        <button
                          onClick={() => handleToggleToday(task.id, plannedToday)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-all ${
                            plannedToday
                              ? 'bg-green-50 text-green-700 border border-green-200/80 shadow-2xs'
                              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent'
                          }`}
                          title={plannedToday ? 'Planned for Today (click to remove)' : 'Add to Today'}
                        >
                          {plannedToday ? (
                            <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                          ) : (
                            <Sun className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span>Today</span>
                        </button>

                        {/* Edit Task Button */}
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          title="Edit task details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => storage.deleteTask(task.id)}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Events Section: Sitting below tasks */}
          <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle overflow-hidden">
            <div className="p-3.5 bg-[#fafafa] border-b border-[#ebebeb] flex items-center justify-between text-xs text-neutral-600 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-900" />
                <span className="font-semibold text-neutral-900">Events</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-neutral-200 text-neutral-700">
                  {activeEvents.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCreateType('event')}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>New Event</span>
              </button>
            </div>

            {activeEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                <Calendar className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
                <p className="font-medium text-neutral-600">No events in this inbox</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Switch to the Event tab above to create meetings and scheduled entries.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#ebebeb]/70">
                {activeEvents.map((evt) => {
                  const inboxInfo = inboxes.find((i) => i.id === evt.inboxId);
                  return (
                    <li
                      key={evt.id}
                      className="p-3.5 flex items-start justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors group"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => storage.toggleEvent(evt.id)}
                          className="flex-shrink-0 mt-0.5"
                          title="Complete event"
                        >
                          <Circle className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: inboxInfo?.color || '#171717' }}
                            />
                            <p className="text-xs font-semibold text-neutral-900 truncate">
                              {evt.title}
                            </p>
                            {inboxInfo && (
                              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded">
                                {inboxInfo.name}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 font-mono">
                            {evt.date && (
                              <span className="inline-flex items-center gap-1 text-neutral-700">
                                <Calendar className="w-3 h-3 text-neutral-400" />
                                <span>{evt.date}</span>
                              </span>
                            )}
                            {evt.time && (
                              <span className="inline-flex items-center gap-1 text-neutral-900 font-medium">
                                <Clock className="w-3 h-3 text-neutral-400" />
                                <span>{evt.time}</span>
                              </span>
                            )}
                            {evt.location && (
                              <span className="inline-flex items-center gap-1 text-neutral-600">
                                <MapPin className="w-3 h-3 text-neutral-400" />
                                <span className="truncate">{evt.location}</span>
                              </span>
                            )}
                          </div>

                          {evt.description && (
                            <p className="text-[11px] text-neutral-500 pt-0.5">
                              {evt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingEvent(evt)}
                          className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          title="Edit event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete event "${evt.title}"?`)) {
                              storage.deleteEvent(evt.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Archive Section: Collapsed by default, no completed counter */}
          <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle overflow-hidden">
            <button
              type="button"
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
              className="w-full p-3.5 bg-[#fafafa] hover:bg-neutral-100/70 flex items-center justify-between text-xs text-neutral-700 font-medium transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <Archive className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-semibold text-neutral-900">Archive</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                  isArchiveOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isArchiveOpen && (
              <div className="border-t border-[#ebebeb] divide-y divide-[#ebebeb]/70">
                {completedTasks.length === 0 && completedEvents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    Archive is empty for this inbox.
                  </div>
                ) : (
                  <>
                    {/* Completed Tasks */}
                    {completedTasks.map((task) => {
                      const inboxInfo = inboxes.find((i) => i.id === task.inboxId);
                      return (
                        <div
                          key={task.id}
                          className="p-3.5 flex items-center justify-between gap-3 bg-[#fafafa]/40 hover:bg-[#fafafa] transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => storage.toggleTask(task.id)}
                              className="flex-shrink-0"
                              title="Restore to active tasks"
                            >
                              <CheckCircle2 className="w-4 h-4 text-neutral-900 fill-neutral-200" />
                            </button>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate line-through text-neutral-400">
                                {task.title}
                              </p>
                              {inboxInfo && (
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {inboxInfo.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => storage.toggleTask(task.id)}
                              className="text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors"
                              title="Uncomplete and restore"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => storage.deleteTask(task.id)}
                              className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Completed Events */}
                    {completedEvents.map((evt) => {
                      const inboxInfo = inboxes.find((i) => i.id === evt.inboxId);
                      return (
                        <div
                          key={evt.id}
                          className="p-3.5 flex items-center justify-between gap-3 bg-[#fafafa]/40 hover:bg-[#fafafa] transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => storage.toggleEvent(evt.id)}
                              className="flex-shrink-0"
                              title="Restore to active events"
                            >
                              <CheckCircle2 className="w-4 h-4 text-neutral-900 fill-neutral-200" />
                            </button>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate line-through text-neutral-400">
                                {evt.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                                {evt.date && <span>{evt.date}</span>}
                                {evt.time && <span>• {evt.time}</span>}
                                {inboxInfo && <span>• {inboxInfo.name}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => storage.toggleEvent(evt.id)}
                              className="text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors"
                              title="Uncomplete and restore"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => storage.deleteEvent(evt.id)}
                              className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        inboxes={inboxes}
        onClose={() => setEditingTask(null)}
      />

      {/* Event Edit Modal */}
      <EventEditModal
        event={editingEvent}
        inboxes={inboxes}
        onClose={() => setEditingEvent(null)}
      />
    </div>
  );
};
