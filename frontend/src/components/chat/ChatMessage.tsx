// frontend/src/components/chat/ChatMessage.tsx
import React from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'character';
  characterName?: string; // Optional: for character's name display
  avatarUrl?: string;     // Optional: for character's avatar
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div 
      data-testid="message-container"
      className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          p-3 rounded-lg break-words
          max-w-2xl md:max-w-3xl lg:max-w-4xl // Significantly increased max-width
          ${isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
          }
        `}
      >
        {message.characterName && (
          <p 
            data-testid="character-name"
            className="text-xs font-semibold mb-1"
          >
            {message.characterName}
          </p>
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
