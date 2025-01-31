import { Event } from '../types/Event';
import { api } from '../utils/api';
import { parseISO, addHours, setHours, setMinutes } from 'date-fns';

interface ChatResponse {
    text: string;
    action?: 'add' | 'edit' | 'delete';
    success?: boolean;
}

export class ChatService {
    static async processMessage(message: string, events: Event[]): Promise<ChatResponse> {
        const lowerMessage = message.toLowerCase();

        // Add event patterns
        if (lowerMessage.includes('add') || lowerMessage.includes('schedule') || lowerMessage.includes('create')) {
            return await this.handleAddEvent(message);
        }

        // Edit event patterns
        if (lowerMessage.includes('edit') || lowerMessage.includes('update') || lowerMessage.includes('change') || lowerMessage.includes('move')) {
            return await this.handleEditEvent(message, events);
        }

        // Delete event patterns
        if (lowerMessage.includes('delete') || lowerMessage.includes('remove') || lowerMessage.includes('cancel')) {
            return await this.handleDeleteEvent(message, events);
        }

        return {
            text: "I'm not sure what you want to do with the calendar. Try saying something like:\n" +
                "- 'Add a meeting tomorrow at 2pm'\n" +
                "- 'Move my 3pm meeting to 4pm'\n" +
                "- 'Delete the meeting with Don Vito'"
        };
    }

    private static async handleAddEvent(message: string): Promise<ChatResponse> {
        try {
            // Basic example - we'll enhance this with better NLP later
            const eventDetails = this.extractEventDetails(message);
            if (!eventDetails) {
                return {
                    text: "I couldn't understand the event details. Could you be more specific? For example: 'Add a meeting with Don Vito tomorrow at 2pm'",
                    action: 'add',
                    success: false
                };
            }

            const event = await api.createEvent({
                title: eventDetails.title,
                description: eventDetails.description || '',
                start: eventDetails.start,
                end: addHours(eventDetails.start, 1), // Default 1-hour duration
                color: 'var(--tokyo-purple)'
            });

            return {
                text: `Got it, boss! I've added "${event.title}" to your calendar for ${event.start.toLocaleString()}.`,
                action: 'add',
                success: true
            };
        } catch (error) {
            return {
                text: "Sorry boss, I couldn't add that event. Something went wrong.",
                action: 'add',
                success: false
            };
        }
    }

    private static async handleEditEvent(message: string, events: Event[]): Promise<ChatResponse> {
        try {
            // Find the event to edit based on title/time mentioned in message
            const event = this.findEventInMessage(message, events);
            if (!event) {
                return {
                    text: "I couldn't find that event. Could you specify which event you want to edit?",
                    action: 'edit',
                    success: false
                };
            }

            const updates = this.extractEventUpdates(message);
            if (!updates) {
                return {
                    text: "I'm not sure what changes you want to make. Could you be more specific?",
                    action: 'edit',
                    success: false
                };
            }

            const updatedEvent = await api.updateEvent({
                ...event,
                ...updates
            });

            return {
                text: `I've updated "${updatedEvent.title}" for you, boss.`,
                action: 'edit',
                success: true
            };
        } catch (error) {
            return {
                text: "Sorry boss, I couldn't make those changes. Something went wrong.",
                action: 'edit',
                success: false
            };
        }
    }

    private static async handleDeleteEvent(message: string, events: Event[]): Promise<ChatResponse> {
        try {
            const event = this.findEventInMessage(message, events);
            if (!event) {
                return {
                    text: "I couldn't find that event. Which event did you want to delete?",
                    action: 'delete',
                    success: false
                };
            }

            await api.deleteEvent(event.id);

            return {
                text: `I've removed "${event.title}" from your calendar, boss.`,
                action: 'delete',
                success: true
            };
        } catch (error) {
            return {
                text: "Sorry boss, I couldn't delete that event. Something went wrong.",
                action: 'delete',
                success: false
            };
        }
    }

    private static extractEventDetails(message: string): Partial<Event> | null {
        // This is a basic implementation - we'll enhance it later
        const words = message.split(' ');
        const titleWords = [];
        let start = new Date();

        // Very basic time extraction - we'll make this more sophisticated
        for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            if (word.includes('at')) {
                const timeStr = words[i + 1];
                if (timeStr) {
                    const [hour, modifier] = timeStr.split(/(\d+)([ap]m)/i);
                    if (hour) {
                        const hourNum = parseInt(hour);
                        start = setHours(start, modifier?.toLowerCase() === 'pm' ? hourNum + 12 : hourNum);
                        start = setMinutes(start, 0);
                        break;
                    }
                }
            } else {
                titleWords.push(words[i]);
            }
        }

        if (titleWords.length === 0) return null;

        return {
            title: titleWords.join(' '),
            start,
            end: addHours(start, 1)
        };
    }

    private static findEventInMessage(message: string, events: Event[]): Event | null {
        const lowerMessage = message.toLowerCase();
        return events.find(event =>
            lowerMessage.includes(event.title.toLowerCase()) ||
            lowerMessage.includes(event.description?.toLowerCase() || '')
        ) || null;
    }

    private static extractEventUpdates(message: string): Partial<Event> | null {
        // Basic implementation - we'll enhance this later
        const updates: Partial<Event> = {};
        const words = message.split(' ');

        for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            if (word === 'to' && words[i + 1]) {
                const timeStr = words[i + 1];
                const [hour, modifier] = timeStr.split(/(\d+)([ap]m)/i);
                if (hour) {
                    const hourNum = parseInt(hour);
                    const newTime = new Date();
                    updates.start = setHours(newTime, modifier?.toLowerCase() === 'pm' ? hourNum + 12 : hourNum);
                    updates.end = addHours(updates.start, 1);
                    break;
                }
            }
        }

        return Object.keys(updates).length > 0 ? updates : null;
    }
} 