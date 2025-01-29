import React, { useState } from 'react';
import { format } from 'date-fns';
import { Event } from '../types/Event';

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, onDelete }) => {
  const { title, description, start, end, color = 'var(--tokyo-blue)' } = event;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setIsExpanded(!isExpanded);
    onClick?.(event);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative p-2 rounded mb-2 cursor-pointer transition-all
                bg-[var(--tokyo-bg)] hover:bg-[var(--tokyo-bg)]/80 border border-[var(--tokyo-border)]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-2 pr-8">
        <span className="text-xs text-[var(--tokyo-purple)]">
          {format(start, 'h:mm a')}
        </span>
        <h3 className="font-medium text-[var(--tokyo-cyan)] flex-1 truncate">{title}</h3>
        <svg
          className={`w-4 h-4 text-[var(--tokyo-purple)] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="p-1 text-[var(--tokyo-red)] hover:bg-[var(--tokyo-red)]/10 rounded-full"
          title="Delete Event"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-[var(--tokyo-border)]" onClick={e => e.stopPropagation()}>
          <div className="text-xs text-[var(--tokyo-purple)]">
            {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
          </div>
          {description && (
            <p className="mt-1 text-sm text-[var(--tokyo-fg)]/80">{description}</p>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-[var(--tokyo-bg)]/95 backdrop-blur-sm flex items-center justify-center rounded"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div className="p-4 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-sm text-[var(--tokyo-fg)] mb-3">
              Are you sure you want to delete this event?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(event);
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1 bg-[var(--tokyo-red)] text-[var(--tokyo-bg)] text-sm rounded hover:bg-[var(--tokyo-red)]/90"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1 bg-[var(--tokyo-bg-lighter)] text-[var(--tokyo-fg)] text-sm rounded hover:bg-[var(--tokyo-bg-lighter)]/90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 