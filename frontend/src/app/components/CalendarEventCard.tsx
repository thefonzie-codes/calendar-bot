import React, { useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { Event } from '../types/Event';

interface CalendarEventCardProps {
    event: Event;
    onUpdate?: (event: Event) => void;
    onDelete?: (event: Event) => void;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ event, onUpdate, onDelete }) => {
    const { title, start, end, color = 'var(--tokyo-blue)' } = event;
    const [isViewingDetails, setIsViewingDetails] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEvent, setEditedEvent] = useState(event);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const calculateEventHeight = () => {
        const durationInMinutes = differenceInMinutes(end, start);
        return (durationInMinutes / 15) * 15; // 15px per 15 minutes
    };

    const handleSave = () => {
        onUpdate?.(editedEvent);
        setIsEditing(false);
        setIsViewingDetails(false);
    };

    return (
        <>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsViewingDetails(true);
                }}
                className="group relative p-1 rounded cursor-pointer transition-all h-full
                    bg-[var(--tokyo-bg)] hover:bg-[var(--tokyo-bg)]/80 border border-[var(--tokyo-border)]"
                style={{
                    borderLeft: `4px solid ${color}`,
                    height: `${calculateEventHeight()}px`
                }}
            >
                <h3 className="font-bold text-[var(--tokyo-cyan)] truncate text-xs mb-0.5">{title}</h3>
                <div className="flex items-center gap-1 text-xs text-[var(--tokyo-purple)]">
                    <span>{format(start, 'h:mm a')}</span>
                    {calculateEventHeight() > 30 && (
                        <>
                            <span>-</span>
                            <span>{format(end, 'h:mm a')}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {isViewingDetails && !isEditing && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsViewingDetails(false);
                        }
                    }}
                >
                    <div className="bg-[var(--tokyo-bg-lighter)] p-6 rounded-lg shadow-xl w-96" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-[var(--tokyo-cyan)]">
                                Event Details
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setEditedEvent(event);
                                        setIsEditing(true);
                                    }}
                                    className="p-1 text-[var(--tokyo-cyan)] hover:bg-[var(--tokyo-cyan)]/10 rounded-full transition-colors"
                                    title="Edit Event"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-1 text-[var(--tokyo-red)] hover:bg-[var(--tokyo-red)]/10 rounded-full transition-colors"
                                    title="Delete Event"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsViewingDetails(false)}
                                    className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                                    title="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-bold text-[var(--tokyo-cyan)] mb-1">{title}</h4>
                                <div className="text-sm text-[var(--tokyo-purple)]">
                                    {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                                </div>
                            </div>

                            {event.description && (
                                <div className="text-[var(--tokyo-fg)] text-sm">
                                    {event.description}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditing && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsEditing(false);
                            setEditedEvent(event);
                        }
                    }}
                >
                    <div className="bg-[var(--tokyo-bg-lighter)] p-6 rounded-lg shadow-xl w-96" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-[var(--tokyo-cyan)]">
                                Edit Event
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedEvent(event);
                                }}
                                className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <input
                            type="text"
                            value={editedEvent.title}
                            onChange={(e) => setEditedEvent(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full mb-4 p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
                        />

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-[var(--tokyo-purple)] mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={format(editedEvent.start, 'HH:mm')}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newStart = new Date(editedEvent.start);
                                        newStart.setHours(hours, minutes);
                                        setEditedEvent(prev => ({ ...prev, start: newStart }));
                                    }}
                                    className="w-full p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--tokyo-purple)] mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={format(editedEvent.end, 'HH:mm')}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newEnd = new Date(editedEvent.end);
                                        newEnd.setHours(hours, minutes);
                                        setEditedEvent(prev => ({ ...prev, end: newEnd }));
                                    }}
                                    className="w-full p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
                                />
                            </div>
                        </div>

                        <textarea
                            value={editedEvent.description}
                            onChange={(e) => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full mb-4 p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
                            rows={3}
                            placeholder="Description (optional)"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-[var(--tokyo-green)] text-[var(--tokyo-bg)] rounded hover:bg-[var(--tokyo-green)]/90"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedEvent(event);
                                }}
                                className="px-4 py-2 bg-[var(--tokyo-red)] text-[var(--tokyo-bg)] rounded hover:bg-[var(--tokyo-red)]/90"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowDeleteConfirm(false);
                        }
                    }}
                >
                    <div className="bg-[var(--tokyo-bg-lighter)] p-6 rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[var(--tokyo-cyan)] mb-4">Delete Event</h3>
                        <p className="text-[var(--tokyo-fg)] mb-6">Are you sure you want to delete this event?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    onDelete?.(event);
                                    setShowDeleteConfirm(false);
                                    setIsEditing(false);
                                    setIsViewingDetails(false);
                                }}
                                className="px-4 py-2 bg-[var(--tokyo-red)] text-[var(--tokyo-bg)] rounded hover:bg-[var(--tokyo-red)]/90"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)] rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}; 
