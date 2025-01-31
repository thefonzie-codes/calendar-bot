import { Event } from '../types/Event';
import { api } from '../utils/api';

interface ChatResponse {
    text: string;
    action?: 'add' | 'edit' | 'delete';
    success?: boolean;
}

interface CalendarAction {
    type: 'create' | 'update' | 'delete';
    title?: string;
    description?: string;
    start?: string;
    end?: string;
    event_id?: string;
}

interface AIResponse {
    message: string;
    action?: CalendarAction;
}

export class ChatService {
    static async processMessage(message: string, events: Event[]): Promise<ChatResponse> {
        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to process message');
            }

            const data: AIResponse = await response.json();

            // Handle any calendar actions
            if (data.action) {
                switch (data.action.type) {
                    case 'create':
                        if (data.action.title && data.action.start && data.action.end) {
                            await api.createEvent({
                                title: data.action.title,
                                description: data.action.description || '',
                                start: new Date(data.action.start),
                                end: new Date(data.action.end),
                                color: 'var(--tokyo-purple)'
                            });
                        }
                        break;

                    case 'update':
                        if (data.action.event_id) {
                            const event = events.find(e => e.id === data.action.event_id);
                            if (event) {
                                await api.updateEvent({
                                    ...event,
                                    title: data.action.title || event.title,
                                    description: data.action.description || event.description,
                                    start: data.action.start ? new Date(data.action.start) : event.start,
                                    end: data.action.end ? new Date(data.action.end) : event.end,
                                });
                            }
                        }
                        break;

                    case 'delete':
                        if (data.action.event_id) {
                            await api.deleteEvent(data.action.event_id);
                        }
                        break;
                }
            }

            return {
                text: data.message,
                action: data.action?.type,
                success: true,
            };
        } catch (error) {
            console.error('Error processing message:', error);
            return {
                text: "Gomen ne, something went wrong while processing your message. Could you try again?",
                success: false,
            };
        }
    }
} 