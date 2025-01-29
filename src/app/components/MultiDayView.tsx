import React, { useEffect } from 'react';
import {
    format,
    addMinutes,
    startOfDay,
    addDays,
    isToday,
    startOfWeek,
    eachDayOfInterval,
    setMinutes,
    setHours,
    getHours,
    getMinutes,
    isSameDay,
    isWithinInterval,
    differenceInMinutes
} from 'date-fns';
import { Event } from '../types/Event';

interface MultiDayViewProps {
    date: Date;
    events: Event[];
    onTimeSlotClick: (date: Date) => void;
    onDateChange: (date: Date) => void;
    numberOfDays?: 3 | 7;
}

export const MultiDayView: React.FC<MultiDayViewProps> = ({
    date,
    events,
    onTimeSlotClick,
    onDateChange,
    numberOfDays = 7
}) => {
    const startDate = numberOfDays === 7 ? startOfWeek(date) : date;
    const days = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, numberOfDays - 1)
    });

    const timeSlots = Array.from({ length: 96 }, (_, i) => addMinutes(startOfDay(date), i * 15));

    const navigateDays = (direction: 'prev' | 'next') => {
        const newDate = addDays(date, direction === 'next' ? numberOfDays : -numberOfDays);
        onDateChange(newDate);
    };

    const goToToday = () => {
        onDateChange(new Date());
    };

    const calculateEventHeight = (event: Event) => {
        const durationInMinutes = differenceInMinutes(event.end, event.start);
        const heightInPixels = (durationInMinutes / 15) * 15; // 15px per 15 minutes
        return heightInPixels;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    navigateDays('prev');
                    break;
                case 'ArrowRight':
                    navigateDays('next');
                    break;
                case 't':
                    if (!e.ctrlKey && !e.metaKey) {
                        goToToday();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [date]);

    return (
        <div className="w-full max-w-5xl mx-auto rounded-lg bg-[var(--tokyo-bg-lighter)] shadow-xl overflow-auto">
            <div className="sticky top-0 bg-[var(--tokyo-bg-lighter)] z-10 p-2 border-b border-[var(--tokyo-border)]">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigateDays('prev')}
                            className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                            title={`Previous ${numberOfDays} Days (←)`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={goToToday}
                            className={`px-2 py-0.5 rounded text-xs transition-colors ${isToday(date)
                                ? 'text-[var(--tokyo-blue)] border border-[var(--tokyo-blue)] hover:bg-[var(--tokyo-blue)]/10'
                                : 'bg-[var(--tokyo-blue)] text-white hover:bg-[var(--tokyo-blue)]/90'
                                }`}
                            title="Today (T)"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigateDays('next')}
                            className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                            title={`Next ${numberOfDays} Days (→)`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid mt-2" style={{ gridTemplateColumns: `80px repeat(${numberOfDays}, 1fr)` }}>
                    <div className="text-center py-1"></div>
                    {days.map(day => (
                        <div
                            key={day.toISOString()}
                            className={`text-center py-1 ${isToday(day) ? 'text-[var(--tokyo-blue)]' : ''}`}
                        >
                            <div className="font-medium text-xs text-[var(--tokyo-purple)]">
                                {format(day, 'EEE')}
                            </div>
                            <div className="text-sm font-bold text-[var(--tokyo-cyan)]">
                                {format(day, 'MMM d')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: `80px repeat(${numberOfDays}, 1fr)` }}>
                {/* Time column */}
                <div>
                    {timeSlots.map((time) => (
                        <div key={time.toISOString()} className={`min-h-[15px] relative ${time.getMinutes() === 0 && time.getHours() !== 0 ? 'border-t border-[var(--tokyo-border)]' : ''
                            }`}>
                            {time.getMinutes() === 0 && (
                                <span className={`text-[11px] text-[var(--tokyo-purple)] absolute -left-1 px-2 py-0.5 bg-[var(--tokyo-bg-lighter)] min-w-[65px] ${time.getHours() === 0 ? '-top-4' : '-top-3 -translate-y-[1px]'
                                    }`}>
                                    {format(time, 'h a')}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {days.map((day) => (
                    <div key={day.toISOString()} className={`border-l border-[var(--tokyo-border)]`}>
                        {timeSlots.map((time) => {
                            const slotStart = setMinutes(setHours(day, getHours(time)), getMinutes(time));
                            const slotEnd = addMinutes(slotStart, 15);
                            const eventsInSlot = events.filter((event) =>
                                isSameDay(event.start, day) &&
                                event.start.getHours() === time.getHours() &&
                                event.start.getMinutes() === time.getMinutes()
                            );

                            return (
                                <div
                                    key={`${day.toISOString()}-${time.toISOString()}`}
                                    className={`min-h-[15px] hover:bg-[var(--tokyo-purple)]/5 transition-colors relative ${time.getMinutes() === 0 && time.getHours() !== 0 ? 'border-t border-[var(--tokyo-border)]' : ''
                                        }`}
                                    onClick={() => onTimeSlotClick(slotStart)}
                                >
                                    {eventsInSlot.map(event => (
                                        <div
                                            key={event.id}
                                            className="absolute left-1 right-1 rounded text-xs overflow-hidden shadow-sm"
                                            style={{
                                                backgroundColor: `var(--tokyo-bg)`,
                                                borderLeft: `2px solid ${event.color}`,
                                                height: `${calculateEventHeight(event)}px`,
                                                zIndex: 10
                                            }}
                                        >
                                            <div className="p-1" style={{ backgroundColor: `${event.color}10` }}>
                                                <div className="font-medium text-[var(--tokyo-cyan)]">{event.title}</div>
                                                <div className="text-[10px] text-[var(--tokyo-fg)]/80">
                                                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                                                </div>
                                                {event.description && (
                                                    <div className="text-[10px] text-[var(--tokyo-fg)]/60 mt-0.5">
                                                        {event.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}; 