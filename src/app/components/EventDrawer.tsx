import React from 'react';
import { format } from 'date-fns';
import { Event } from '../types/Event';

interface EventDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    events: Event[];
    onAddEvent: () => void;
    onDeleteEvent: (event: Event) => void;
}

export const EventDrawer: React.FC<EventDrawerProps> = ({
    isOpen,
    onClose,
    selectedDate,
    events,
    onAddEvent,
    onDeleteEvent
}) => {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 bottom-0 w-80 bg-[var(--tokyo-bg-lighter)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-[var(--tokyo-cyan)]">
                            {selectedDate ? (
                                `Events for ${format(selectedDate, 'MMM d, yyyy')}`
                            ) : (
                                'Select a date'
                            )}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {selectedDate && (
                        <button
                            onClick={onAddEvent}
                            className="w-full px-4 py-2 mb-4 bg-[var(--tokyo-green)] text-[var(--tokyo-bg)] rounded hover:bg-[var(--tokyo-green)]/90 transition-colors"
                        >
                            Add Event
                        </button>
                    )}

                    <div className="space-y-4">
                        {events
                            .filter(event =>
                                selectedDate &&
                                event.start.toDateString() === selectedDate.toDateString()
                            )
                            .map(event => (
                                <div
                                    key={event.id}
                                    className="p-3 rounded bg-[var(--tokyo-bg)] shadow-sm"
                                    style={{ borderLeft: `2px solid ${event.color}` }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium text-[var(--tokyo-cyan)]">{event.title}</div>
                                        <button
                                            onClick={() => onDeleteEvent(event)}
                                            className="p-1 text-[var(--tokyo-red)] hover:bg-[var(--tokyo-red)]/10 rounded transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-sm text-[var(--tokyo-fg)]/80 mt-1">
                                        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                                    </div>
                                    {event.description && (
                                        <div className="text-sm text-[var(--tokyo-fg)]/60 mt-2">
                                            {event.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
}; 