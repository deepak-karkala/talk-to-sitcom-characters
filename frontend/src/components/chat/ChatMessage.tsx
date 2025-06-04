// frontend/src/components/chat/ChatMessage.tsx
import React from 'react';
import Image from 'next/image'; // Import Next.js Image component

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'character';
  characterName?: string; // Optional, only for character messages
  imageUrl?: string; // Optional, for user messages with images
  avatarUrl?: string; // Added for avatar
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const userAvatarUrl = '/characters/user/avatar.png'; // Define a default user avatar

  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white message-bubble-user' // User messages remain blue
    : 'bg-gray-300 dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 message-bubble-character'; // Character messages updated

  // Avatar component
  const Avatar = ({ src, alt }: { src: string; alt: string }) => (
    <Image
      src={src}
      alt={alt}
      width={32} // sm: 40
      height={32} // sm: 40
      className="rounded-full"
      priority // Eager load avatars as they are likely in viewport
    />
  );

  const messageContent = (
    <div
      className={`
        p-3 rounded-lg break-words
        max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl // Adjusted max-widths slightly
        ${bubbleClasses}
        shadow-lg // Added shadow for floating effect
      `}
    >
      {!isUser && message.characterName && (
        <p className="text-xs font-semibold mb-1" data-testid="character-name">
          {message.characterName}
        </p>
      )}
      {message.imageUrl && (
        <div className="my-2">
          <img
            src={message.imageUrl}
            alt="Uploaded content"
            className="rounded-md max-w-xs max-h-64 object-contain"
          />
        </div>
      )}
      <p className="whitespace-pre-wrap">{message.text}</p>
    </div>
  );

  return (
    <div
      className={`flex items-end mb-3 gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
      data-testid="message-container"
    >
      {!isUser && message.avatarUrl && (
        <div className="flex-shrink-0">
          <Avatar src={message.avatarUrl} alt={message.characterName || 'Character'} />
        </div>
      )}
      {messageContent}
      {isUser && (
        <div className="flex-shrink-0">
          <Avatar src={userAvatarUrl} alt="User" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
