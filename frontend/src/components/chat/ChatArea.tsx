// frontend/src/components/chat/ChatArea.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import ChatMessageComponent, { Message as ChatMessageInterface } from './ChatMessage'; // Renamed to avoid conflict with 'ai' Message type
import { Message as VercelAIMessage } from 'ai'; // Vercel AI SDK Message type

interface ChatAreaProps {
  messages: VercelAIMessage[]; // Messages from useChat hook
  // Add other props like isLoading if needed for typing indicator
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollableContainerRef}
        // Removed fixed height, should take space from parent flex container in page.tsx
        className="flex-grow bg-white dark:bg-gray-700 p-4 my-0 rounded-md shadow overflow-y-auto"
    >
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-400 dark:text-gray-500">
            No messages yet. Say hi to Chandler!
          </p>
        </div>
      )}
      {messages.map((msg) => {
        const adaptedMessage: ChatMessageInterface = {
          id: msg.id,
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'character',
            characterName: msg.role !== 'user' ? 'Chandler' : undefined,
        };
        return <ChatMessageComponent key={msg.id} message={adaptedMessage} />;
      })}
      {/* Typing indicator can be added here based on isLoading prop */}
    </div>
  );
};

export default ChatArea;
