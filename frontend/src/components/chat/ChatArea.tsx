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
      // Applied card styles. Removed temporary border.
      className="flex-grow bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 my-0 overflow-y-auto"
    >
      {messages.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          {/* Text color for placeholder against card background */}
          <p className="text-slate-500 dark:text-slate-400"> No messages yet. Say hi to Chandler! </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div data-testid="typing-indicator" className="flex justify-center items-center py-2">
              <p className="text-slate-500 dark:text-slate-400"> Chandler is typing... </p>
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
