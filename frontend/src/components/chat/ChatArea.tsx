// frontend/src/components/chat/ChatArea.tsx
"use client";
import React from 'react';
import ChatMessage, { Message } from './ChatMessage';
// import { Message as VercelAIMessage } from 'ai/react'; // Assuming this is the type for Vercel AI SDK messages

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, error }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      // Removed brightness filter and reverted placeholder text styling
      className="flex-grow overflow-y-auto mb-4 bg-[url('/characters/chandler/background.png')] bg-cover bg-center p-4 rounded-lg"
    >
      {messages.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-slate-500 dark:text-neutral-400"> No messages yet. Say hi to Chandler! </p>
        </div>
      ) : (
        <div className="space-y-4 px-12">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div data-testid="typing-indicator" className="flex justify-center items-center py-2">
              <p className="text-slate-500 dark:text-neutral-400"> Chandler is typing... </p>
            </div>
          )}
          {error && (
            <div className="flex justify-center items-center py-2">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatArea;
