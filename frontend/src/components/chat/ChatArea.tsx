// frontend/src/components/chat/ChatArea.tsx
"use client";
import React, { useEffect, useRef } from 'react';
import ChatMessageComponent, { Message as ChatMessageInterface } from './ChatMessage'; // Assuming ChatMessage.tsx exists
import { Message as VercelAIMessage } from 'ai';

interface ChatAreaProps { messages: VercelAIMessage[]; }

const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
      if (scrollableContainerRef.current) {
        scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
      }
  }, [messages]);

  return (
    <div
      ref={scrollableContainerRef}
      className="flex-grow p-4 my-0 overflow-y-auto border border-black" // Removed bg-, shadow-. Added border.
    >
      {messages.length === 0 && ( <div className="flex justify-center items-center h-full"> <p className="text-black"> No messages yet. Say hi to Chandler! </p> </div> )} {/* text-black */}
      {messages.map((msg) => {
        const adaptedMessage: ChatMessageInterface = { id: msg.id, text: msg.content, sender: msg.role === 'user' ? 'user' : 'character', characterName: msg.role !== 'user' ? 'Chandler' : undefined, };
        // Individual chat messages will retain their blue/gray backgrounds for now for differentiation.
        return <ChatMessageComponent key={msg.id} message={adaptedMessage} />;
      })}
    </div>
  );
};
export default ChatArea;
