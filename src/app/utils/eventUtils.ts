import { Event } from '../types/Event';
import eventsData from '../data/events.json';

export const loadEvents = (): Event[] => {
  try {
    return eventsData.events.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

export const saveEvent = async (event: Event): Promise<void> => {
  // In a real application, this would make an API call to save the event
  console.log('Saving event:', event);
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  // In a real application, this would make an API call to delete the event
  console.log('Deleting event:', eventId);
}; 