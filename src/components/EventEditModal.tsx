import React, { useState } from 'react';
import { InboxEvent, InboxGroup } from '../types';
import { storage } from '../services/storage';
import { X, Trash2, Calendar, Clock, MapPin, Tag } from 'lucide-react';

interface EventEditModalProps {
  event: InboxEvent | null;
  inboxes: InboxGroup[];
  onClose: () => void;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({
  event,
  inboxes,
  onClose,
}) => {
  if (!event) return null;

  const [title, setTitle] = useState(event.title);
  const [inboxId, setInboxId] = useState(event.inboxId || inboxes[0]?.id || 'inbox-general');
  const [date, setDate] = useState(event.date || '');
  const [time, setTime] = useState(event.time || '');
  const [location, setLocation] = useState(event.location || '');
  const [description, setDescription] = useState(event.description || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    storage.updateEvent(event.id, {
      title: title.trim(),
      inboxId,
      date,
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Delete event "${event.title}"?`)) {
      storage.deleteEvent(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-xl border border-[#ebebeb] shadow-modal max-w-lg w-full p-6 space-y-5 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
          <h2 className="text-sm font-semibold text-neutral-900">Edit Event</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              placeholder="e.g. Sprint Planning, Dental Checkup..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Time (optional)</span>
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM or 14:30"
                className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Location (optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Zoom, Meeting Room 3, 123 Main St"
              className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span>Inbox</span>
            </label>
            <select
              value={inboxId}
              onChange={(e) => setInboxId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
            >
              {inboxes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Description / Notes (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Agenda or notes for this event..."
              className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#ebebeb]">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Event</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-subtle"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
