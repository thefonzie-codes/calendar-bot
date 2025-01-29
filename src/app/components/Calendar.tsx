import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { Event } from '../types/Event';

interface CalendarProps {
    onDateSelect?: (date: Date) => void;
    events: Event[];
}

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect, events }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const handleDateClick = (date: Date) => {
        onDateSelect?.(date);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(event =>
            event.start.toDateString() === date.toDateString()
        );
    };

    return (
        <div className="w-full max-w-3xl mx-auto rounded-lg bg-[var(--tokyo-bg-lighter)] shadow-xl">
            <div className="flex justify-between items-center p-2 border-b border-[var(--tokyo-fg)]/10">
                <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold text-[var(--tokyo-cyan)]">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 text-[var(--tokyo-purple)] hover:bg-[var(--tokyo-purple)]/10 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center py-1 text-xs font-medium text-[var(--tokyo-purple)]">
                        {day}
                    </div>
                ))}

                {daysInCalendar.map(date => {
                    const dayEvents = getEventsForDate(date);
                    return (
                        <div
                            key={date.toISOString()}
                            onClick={() => handleDateClick(date)}
                            className={`
                                relative min-h-[80px] p-1 border-[0.5px] border-[var(--tokyo-fg)]/10
                                cursor-pointer transition-colors
                                ${isToday(date) ? 'bg-[var(--tokyo-blue)]/10' : ''}
                                ${!isSameMonth(date, currentDate) ? 'text-[var(--tokyo-fg)]/40' : ''}
                                hover:bg-[var(--tokyo-purple)]/5
                            `}
                        >
                            <span className={`
                                inline-flex w-5 h-5 items-center justify-center rounded-full text-xs
                                ${isToday(date) ? 'bg-[var(--tokyo-blue)] text-white' : ''}
                            `}>
                                {format(date, 'd')}
                            </span>

                            <div className="mt-1 space-y-0.5 overflow-hidden">
                                {dayEvents.slice(0, 3).map((event, index) => (
                                    <div
                                        key={event.id}
                                        className="text-[10px] truncate px-1 py-0.5 rounded"
                                        style={{
                                            backgroundColor: `${event.color}20`,
                                            borderLeft: `2px solid ${event.color}`
                                        }}
                                    >
                                        {format(event.start, 'HH:mm')} {event.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[10px] text-[var(--tokyo-fg)]/60 pl-1">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 