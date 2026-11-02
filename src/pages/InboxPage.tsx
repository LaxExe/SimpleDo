import React, { useState } from 'react';
import { InboxItem } from '../types';
import { storage } from '../services/storage';
import { 
  Inbox, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface InboxPageProps {
  inbox: InboxItem[];
  onNavigateToTasks: () => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({
  inbox,
  onNavigateToTasks,
}) => {
  const [content, setContent] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    storage.addInboxItem(content);
    setContent('');
  };

  const handleConvertToTask = (id: string) => {
    storage.convertInboxToTask(id);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#ebebeb]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Inbox
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Frictionless quick-capture for fleeting thoughts, ideas, and items to sort later.
          </p>
        </div>
        <div className="text-xs text-neutral-500 font-mono">
          {inbox.length} {inbox.length === 1 ? 'item' : 'items'} captured
        </div>
      </div>

      {/* Quick Input Bar */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-2.5 rounded-lg border border-[#ebebeb] shadow-subtle flex items-center gap-2"
      >
        <div className="pl-2 text-neutral-400">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a thought, task, or reminder and press Enter..."
          autoFocus
          className="flex-1 px-2 py-1.5 text-sm bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Capture</span>
        </button>
      </form>

      {/* Inbox List */}
      <div className="bg-white rounded-lg border border-[#ebebeb] shadow-subtle overflow-hidden">
        {inbox.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-800">Inbox is empty</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Your inbox is clean. Whenever you have an unformed idea or quick task, drop it here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#ebebeb]/70">
            {inbox.map((item) => (
              <li
                key={item.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#fafafa]/80 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-900 leading-relaxed">
                    {item.content}
                  </p>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    Captured {new Date(item.createdAt).toLocaleDateString()} at{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleConvertToTask(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-[#ebf5ff] hover:bg-[#cce6ff] rounded transition-colors"
                    title="Move to Tasks"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>To Task</span>
                  </button>
                  <button
                    onClick={() => storage.deleteInboxItem(item.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {inbox.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onNavigateToTasks}
            className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
          >
            Go to active tasks <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
