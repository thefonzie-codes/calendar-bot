import React from 'react';

interface ChatButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen }) => {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg 
                      bg-[var(--tokyo-purple)] text-white 
                      hover:bg-[var(--tokyo-purple)]/90 transition-all
                      flex items-center justify-center
                      ${isOpen ? 'scale-90' : 'scale-100'}`}
            title="Chat with AI Assistant"
        >
            {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                </svg>
            )}
        </button>
    );
}; 