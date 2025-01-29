import React, { useState } from 'react';
import { format } from 'date-fns';
import { Event } from '../types/Event';

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onUpdate?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, onDelete, onUpdate }) => {
  const { title, description, start, end, color = 'var(--tokyo-blue)' } = event;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) {
      setIsExpanded(!isExpanded);
      onClick?.(event);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsExpanded(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.(editedEvent);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedEvent(event);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 rounded mb-2 bg-[var(--tokyo-bg)] border border-[var(--tokyo-border)]"
        style={{ borderLeft: `4px solid ${color}` }}>
        <input
          type="text"
          value={editedEvent.title}
          onChange={(e) => setEditedEvent(prev => ({ ...prev, title: e.target.value }))}
          className="w-full mb-2 p-2 rounded bg-[var(--tokyo-bg-lighter)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs text-[var(--tokyo-purple)] mb-1">Start Time</label>
            <input
              type="time"
              value={format(editedEvent.start, 'HH:mm')}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newStart = new Date(editedEvent.start);
                newStart.setHours(hours, minutes);
                setEditedEvent(prev => ({ ...prev, start: newStart }));
              }}
              className="w-full p-2 rounded bg-[var(--tokyo-bg-lighter)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--tokyo-purple)] mb-1">End Time</label>
            <input
              type="time"
              value={format(editedEvent.end, 'HH:mm')}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newEnd = new Date(editedEvent.end);
                newEnd.setHours(hours, minutes);
                setEditedEvent(prev => ({ ...prev, end: newEnd }));
              }}
              className="w-full p-2 rounded bg-[var(--tokyo-bg-lighter)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
            />
          </div>
        </div>
        <textarea
          value={editedEvent.description}
          onChange={(e) => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
          className="w-full mb-2 p-2 rounded bg-[var(--tokyo-bg-lighter)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
          rows={2}
        />
        <div className="flex justify-between items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="px-3 py-1 text-[var(--tokyo-red)] hover:bg-[var(--tokyo-red)]/10 text-sm rounded"
          >
            Delete Event
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-[var(--tokyo-green)] text-[var(--tokyo-bg)] text-sm rounded hover:bg-[var(--tokyo-green)]/90"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-[var(--tokyo-bg-lighter)] text-[var(--tokyo-fg)] text-sm rounded hover:bg-[var(--tokyo-bg-lighter)]/90"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group relative p-2 rounded mb-2 cursor-pointer transition-all
                bg-[var(--tokyo-bg)] hover:bg-[var(--tokyo-bg)]/80 border border-[var(--tokyo-border)]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="p-1 text-[var(--tokyo-cyan)] hover:bg-[var(--tokyo-cyan)]/10 rounded-full"
          title="Edit Event"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
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