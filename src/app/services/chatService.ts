import { Event } from '../types/Event';
import { api } from '../utils/api';

interface ChatResponse {
    text: string;
    action?: 'add' | 'edit' | 'delete';
    success?: boolean;
}

interface CalendarAction {
    type: 'response' | 'create' | 'update' | 'delete';
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

// Helper function to map backend action types to frontend types
function mapActionType(type: 'response' | 'create' | 'update' | 'delete'): 'add' | 'edit' | 'delete' | undefined {
    switch (type) {
        case 'response': return undefined;
        case 'create': return 'add';
        case 'update': return 'edit';
        case 'delete': return 'delete';
    }
}

export class ChatService {
    static async processMessage(message: string, events: Event[]): Promise<ChatResponse> {
        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to process message');
            }

            const data: AIResponse = await response.json();

            // Just return the response and let the frontend handle the actions
            return {
                text: data.message,
                action: data.action ? mapActionType(data.action.type) : undefined,
                success: true,
            };
        } catch (error) {
            console.error('Error processing message:', error);
            return {
                text: "Something went wrong while processing your message. Could you try again?",
                success: false,
            };
        }
    }
} 