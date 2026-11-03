import React from 'react';
import { storage } from '../services/storage';

interface TaskProgressBarProps {
  taskId: string;
  hasProgress?: boolean;
  completedParts?: number;
  totalParts?: number;
  completed?: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  taskId,
  hasProgress = false,
  completedParts = 0,
  totalParts = 4,
  completed = false,
  size = 'md',
  showLabel = true,
}) => {
  // If progress is not enabled on this task, don't show the progress bar
  if (!hasProgress) {
    return null;
  }

  const currentParts = completed ? totalParts : Math.min(totalParts, Math.max(0, completedParts));

  const handleSegmentClick = (partIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // partIndex is 1, 2, 3, 4
    if (currentParts === partIndex) {
      // Toggle back to 0 or previous
      storage.setTaskProgress(taskId, partIndex - 1);
    } else {
      storage.setTaskProgress(taskId, partIndex);
    }
  };

  const handleResetToZero = (e: React.MouseEvent) => {
    e.stopPropagation();
    storage.setTaskProgress(taskId, 0);
  };

  return (
    <div 
      className="inline-flex items-center gap-2 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 4 Interactive Progress Segments */}
      <div 
        className={`flex items-center gap-1 ${
          size === 'sm' ? 'h-1.5' : 'h-2'
        }`}
        title={`Progress: ${currentParts}/${totalParts}`}
      >
        {[1, 2, 3, 4].map((part) => {
          const isFilled = currentParts >= part;
          return (
            <button
              key={part}
              type="button"
              onClick={(e) => handleSegmentClick(part, e)}
              className={`rounded-full transition-all duration-150 ${
                size === 'sm' ? 'w-4 h-1.5' : 'w-6 sm:w-7 h-2'
              } ${
                isFilled
                  ? 'bg-neutral-900 hover:bg-neutral-700 shadow-2xs'
                  : 'bg-neutral-200 hover:bg-neutral-300'
              }`}
              title={`Set progress to ${part}/${totalParts}`}
            />
          );
        })}
      </div>

      {/* Progress Label - strictly fractions, no % */}
      {showLabel && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
          <span className="font-semibold text-neutral-700">
            {currentParts}/{totalParts}
          </span>
          {currentParts > 0 && !completed && (
            <button
              type="button"
              onClick={handleResetToZero}
              className="text-neutral-400 hover:text-red-600 transition-colors ml-0.5"
              title="Reset to 0/4"
            >
              ↺
            </button>
          )}
        </div>
      )}
    </div>
  );
};
