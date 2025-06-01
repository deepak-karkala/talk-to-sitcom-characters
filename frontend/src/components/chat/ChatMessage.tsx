// frontend/src/components/chat/ChatMessage.tsx
import React from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'character';
  characterName?: string; // Optional: for character's name display
  avatarUrl?: string;     // Optional: for character's avatar
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
            className={`p-3 rounded-lg break-words
                        max-w-lg md:max-w-xl lg:max-w-2xl // Updated max-width classes
                    ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'}`}
      >
        {!isUser && message.characterName && (
          <p className="text-xs font-semibold mb-1">{message.characterName}</p>
        )}
        <p>{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
