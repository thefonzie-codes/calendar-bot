import { Event } from '../types/Event';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    async getEvents(): Promise<Event[]> {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        return events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        }));
    },

    async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
        if (!response.ok) {
            throw new Error('Failed to create event');
        }
        const newEvent = await response.json();
        return {
            ...newEvent,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end)
        };
    },

    async updateEvent(event: Event): Promise<Event> {
        const response = await fetch(`${API_BASE_URL}/events/${event.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
        if (!response.ok) {
            throw new Error('Failed to update event');
        }
        const updatedEvent = await response.json();
        return {
            ...updatedEvent,
            start: new Date(updatedEvent.start),
            end: new Date(updatedEvent.end)
        };
    },

    async deleteEvent(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
    }
}; 