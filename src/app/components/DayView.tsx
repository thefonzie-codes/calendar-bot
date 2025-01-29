import React, { useEffect } from 'react';
import { format, addMinutes, startOfDay, addDays, isToday, differenceInMinutes } from 'date-fns';
import { Event } from '../types/Event';

interface DayViewProps {
    date: Date;
    events: Event[];
    onTimeSlotClick: (date: Date) => void;
    onDateChange: (date: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({ date, events, onTimeSlotClick, onDateChange }) => {
    const timeSlots = Array.from({ length: 96 }, (_, i) => {
        const slotDate = addMinutes(startOfDay(date), i * 15);
        return {
            time: slotDate,
            events: events.filter(event =>
                event.start.toDateString() === date.toDateString() &&
                event.start.getHours() === slotDate.getHours() &&
                Math.floor(event.start.getMinutes() / 15) === Math.floor(slotDate.getMinutes() / 15)
            )
        };
    });

    const navigateDay = (direction: 'prev' | 'next') => {
        const newDate = addDays(date, direction === 'next' ? 1 : -1);
        onDateChange(newDate);
    };

    const goToToday = () => {
        onDateChange(new Date());
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    navigateDay('prev');
                    break;
                case 'ArrowRight':
                    navigateDay('next');
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

    const calculateEventHeight = (event: Event) => {
        const durationInMinutes = differenceInMinutes(event.end, event.start);
        const heightInPixels = (durationInMinutes / 15) * 15; // 15px per 15 minutes
        return heightInPixels;
    };

    return (
        <div className="w-full max-w-3xl mx-auto rounded-lg bg-[var(--tokyo-bg-lighter)] shadow-xl overflow-auto">
            <div className="sticky top-0 bg-[var(--tokyo-bg-lighter)] z-10 p-2 border-b border-[var(--tokyo-border)]">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigateDay('prev')}
                            className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                            title="Previous Day (←)"
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
                    </div>

                    <h2 className="text-xl font-bold text-[var(--tokyo-cyan)]">
                        {format(date, 'EEEE, MMMM d')}
                    </h2>

                    <button
                        onClick={() => navigateDay('next')}
                        className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                        title="Next Day (→)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className="absolute top-0 bottom-0 left-16 border-r border-[var(--tokyo-border)]"></div>
                {timeSlots.map(({ time, events }) => (
                    <div
                        key={time.toISOString()}
                        className={`flex min-h-[15px] hover:bg-[var(--tokyo-purple)]/5 transition-colors relative group ${time.getMinutes() === 0 && time.getHours() !== 0 ? 'border-t border-[var(--tokyo-border)]' : ''
                            }`}
                    >
                        <div className="w-16 flex-shrink-0">
                            {time.getMinutes() === 0 && (
                                <span className={`text-[11px] text-[var(--tokyo-purple)] absolute -left-1 px-2 py-0.5 bg-[var(--tokyo-bg-lighter)] min-w-[65px] ${time.getHours() === 0 ? '-top-4' : '-top-3 -translate-y-[1px]'
                                    }`}>
                                    {format(time, 'h a')}
                                </span>
                            )}
                        </div>
                        <div
                            className="flex-grow cursor-pointer relative"
                            onClick={() => onTimeSlotClick(time)}
                        >
                            {events.map(event => (
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
                    </div>
                ))}
            </div>
        </div>
    );
}; 