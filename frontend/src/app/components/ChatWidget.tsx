import React, { useState } from 'react';
import { Event } from '../types/Event';
import { ChatService } from '../services/chatService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatWidgetProps {
    isOpen: boolean;
    events: Event[];
    onEventsChange: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, events, onEventsChange }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi, I'm your AI calendar assistant. Need help managing your schedule?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isProcessing) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsProcessing(true);

        try {
            const response = await ChatService.processMessage(userMessage.text, events);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);

            if (response.success) {
                onEventsChange();
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry boss, something went wrong. Let me know if you want to try again.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div
            className={`fixed bottom-24 right-6 w-96 bg-[var(--tokyo-bg-lighter)] rounded-lg shadow-xl 
                       transition-all duration-300 transform origin-bottom-right
                       ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
            {/* Header */}
            <div className="p-4 border-b border-[var(--tokyo-border)]">
                <h3 className="text-lg font-bold text-[var(--tokyo-cyan)]">
                    AI Calendar Assistant
                </h3>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                                ? 'bg-[var(--tokyo-purple)] text-white'
                                : 'bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)]'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-line">{message.text}</p>
                            <span className="text-[10px] opacity-70 mt-1 block">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--tokyo-border)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="What can I help you with today?"
                        disabled={isProcessing}
                        className="flex-1 p-2 rounded bg-[var(--tokyo-bg)] text-[var(--tokyo-fg)] 
                                 border border-[var(--tokyo-border)] focus:outline-none 
                                 focus:border-[var(--tokyo-purple)] disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-4 py-2 bg-[var(--tokyo-purple)] text-white rounded 
                                 hover:bg-[var(--tokyo-purple)]/90 transition-colors
                                 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}; 