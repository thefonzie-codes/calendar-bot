'use client';

import { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { DayView } from './components/DayView';
import { MultiDayView } from './components/MultiDayView';
import { EventCard } from './components/EventCard';
import { Event } from './types/Event';
import { api } from './utils/api';
import { ThemeToggle } from './components/ThemeToggle';
import { EventDrawer } from './components/EventDrawer';
import { format } from 'date-fns';
import { ChatButton } from './components/ChatButton';
import { ChatWidget } from './components/ChatWidget';

type ViewType = 'month' | 'week' | '3day' | 'day';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    color: 'var(--tokyo-blue)'
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [view, setView] = useState<'day' | 'week'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await api.getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (currentView === 'month') {
      setCurrentView('day');
    }
  };

  const handleTimeSlotClick = (date: Date) => {
    setSelectedDate(date);
    setNewEvent(prev => ({
      ...prev,
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000) // 1 hour duration by default
    }));
    setIsAddingEvent(true);
  };

  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent.title) return;

    const eventToCreate = {
      title: newEvent.title,
      description: newEvent.description || '',
      start: newEvent.start || selectedDate,
      end: newEvent.end || new Date(selectedDate.getTime() + 60 * 60 * 1000),
      color: newEvent.color || 'var(--tokyo-blue)'
    };

    try {
      const createdEvent = await api.createEvent(eventToCreate);
      setEvents(prev => [...prev, createdEvent]);
      setIsAddingEvent(false);
      setNewEvent({
        title: '',
        description: '',
        color: 'var(--tokyo-blue)'
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventToDelete: Event) => {
    try {
      await api.deleteEvent(eventToDelete.id);
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      await api.updateEvent(updatedEvent);
      await fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-[var(--tokyo-bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--tokyo-purple)]">
            Calendar
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('month')}
                className={`px-4 py-2 rounded transition-colors ${currentView === 'month'
                  ? 'bg-[var(--tokyo-purple)] text-[var(--tokyo-bg)]'
                  : 'text-[var(--tokyo-purple)] border border-[var(--tokyo-border)]'
                  }`}
              >
                Month
              </button>
              <button
                onClick={() => setCurrentView('week')}
                className={`px-4 py-2 rounded transition-colors ${currentView === 'week'
                  ? 'bg-[var(--tokyo-purple)] text-[var(--tokyo-bg)]'
                  : 'text-[var(--tokyo-purple)] border border-[var(--tokyo-border)]'
                  }`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView('3day')}
                className={`px-4 py-2 rounded transition-colors ${currentView === '3day'
                  ? 'bg-[var(--tokyo-purple)] text-[var(--tokyo-bg)]'
                  : 'text-[var(--tokyo-purple)] border border-[var(--tokyo-border)]'
                  }`}
              >
                3 Days
              </button>
              <button
                onClick={() => setCurrentView('day')}
                className={`px-4 py-2 rounded transition-colors ${currentView === 'day'
                  ? 'bg-[var(--tokyo-purple)] text-[var(--tokyo-bg)]'
                  : 'text-[var(--tokyo-purple)] border border-[var(--tokyo-border)]'
                  }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentView === 'month' ? (
              <Calendar
                onDateSelect={handleDateSelect}
                events={events}
                selectedDate={selectedDate}
              />
            ) : currentView === 'day' ? (
              <DayView
                date={selectedDate}
                events={events}
                onTimeSlotClick={handleTimeSlotClick}
                onDateChange={setSelectedDate}
                onEventUpdate={handleUpdateEvent}
                onEventDelete={handleDeleteEvent}
              />
            ) : (
              <MultiDayView
                date={selectedDate}
                events={events}
                onTimeSlotClick={handleTimeSlotClick}
                onDateChange={setSelectedDate}
                onEventUpdate={handleUpdateEvent}
                onEventDelete={handleDeleteEvent}
              />
            )}
          </div>

          <div className="bg-[var(--tokyo-bg-lighter)] p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--tokyo-cyan)]">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              {selectedDate && !isAddingEvent && (
                <button
                  onClick={() => setIsAddingEvent(true)}
                  className="px-4 py-2 text-[var(--tokyo-purple)] border border-[var(--tokyo-border)] rounded hover:bg-[var(--tokyo-purple)] hover:text-[var(--tokyo-bg)] transition-colors"
                >
                  Add Event
                </button>
              )}
            </div>

            <div className="space-y-4">
              {events
                .filter(event =>
                  selectedDate &&
                  event.start.toDateString() === selectedDate.toDateString()
                )
                .map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={(event) => console.log('Event clicked:', event)}
                    onDelete={handleDeleteEvent}
                    onUpdate={handleUpdateEvent}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {isAddingEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddingEvent(false);
              setNewEvent({
                title: '',
                description: '',
                color: 'var(--tokyo-blue)'
              });
            }
          }}
        >
          <div className="bg-[var(--tokyo-bg-lighter)] p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--tokyo-cyan)]">
                New Event
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingEvent(false);
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
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              className="w-full mb-4 p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
            />

            <div className="mb-4">
              <label className="block text-sm text-[var(--tokyo-purple)] mb-1">Date</label>
              <input
                type="date"
                value={newEvent.start ? format(newEvent.start, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const start = newEvent.start ? new Date(newEvent.start) : new Date();
                  const end = newEvent.end ? new Date(newEvent.end) : new Date(start.getTime() + 60 * 60 * 1000);

                  start.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                  end.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

                  setNewEvent(prev => ({
                    ...prev,
                    start,
                    end
                  }));
                }}
                className="w-full p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-[var(--tokyo-purple)] mb-1">Start Time</label>
                <input
                  type="time"
                  value={newEvent.start ? format(newEvent.start, 'HH:mm') : ''}
                  onKeyDown={(e) => {
                    // Allow backspace and delete
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      input.value = '';
                      setNewEvent(prev => ({
                        ...prev,
                        start: prev.start // Keep the existing date
                      }));
                    }
                  }}
                  onChange={(e) => {
                    if (!e.target.value) return; // Skip if empty
                    try {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const start = new Date(newEvent.start || new Date());
                      start.setHours(hours || 0, minutes || 0);

                      // If end time is before new start time, adjust it
                      let end = new Date(newEvent.end || start.getTime() + 60 * 60 * 1000);
                      if (end <= start) {
                        end = new Date(start.getTime() + 60 * 60 * 1000);
                      }

                      setNewEvent(prev => ({
                        ...prev,
                        start,
                        end
                      }));
                    } catch (error) {
                      console.log('Invalid time format');
                    }
                  }}
                  className="w-full p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--tokyo-purple)] mb-1">End Time</label>
                <input
                  type="time"
                  value={newEvent.end ? format(newEvent.end, 'HH:mm') : ''}
                  onKeyDown={(e) => {
                    // Allow backspace and delete
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      input.value = '';
                      setNewEvent(prev => ({
                        ...prev,
                        end: prev.end // Keep the existing date
                      }));
                    }
                  }}
                  onChange={(e) => {
                    if (!e.target.value) return; // Skip if empty
                    try {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const end = new Date(newEvent.end || new Date());
                      end.setHours(hours || 0, minutes || 0);

                      // Only update if end time is after start time
                      if (!newEvent.start || end > newEvent.start) {
                        setNewEvent(prev => ({
                          ...prev,
                          end
                        }));
                      }
                    } catch (error) {
                      console.log('Invalid time format');
                    }
                  }}
                  className="w-full p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
                />
              </div>
            </div>

            <textarea
              placeholder="Description (optional)"
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              className="w-full mb-4 p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] border border-[var(--tokyo-border)]"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-[var(--tokyo-green)] text-[var(--tokyo-bg)] rounded hover:bg-[var(--tokyo-green)]/90"
              >
                Save
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingEvent(false);
                }}
                className="px-4 py-2 bg-[var(--tokyo-red)] text-[var(--tokyo-bg)] rounded hover:bg-[var(--tokyo-red)]/90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} isOpen={isChatOpen} />
      <ChatWidget
        isOpen={isChatOpen}
        events={events}
        onEventsChange={fetchEvents}
      />
    </main>
  );
}

