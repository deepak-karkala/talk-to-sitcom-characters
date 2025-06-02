// frontend/src/components/chat/ChatArea.tsx
"use client";
import React, { useEffect, useRef } from 'react';
import ChatMessageComponent, { Message as ChatMessageInterface } from './ChatMessage';
import { Message as VercelAIMessage } from 'ai';
interface ChatAreaProps { messages: VercelAIMessage[]; }

const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { 
    if (scrollableContainerRef.current) { scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight; }
  }, [messages]);

  return (
    <div 
      ref={scrollableContainerRef}
      // Applied card styles. Removed temporary border.
      className="flex-grow bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 my-0 overflow-y-auto" 
    >
      {messages.length === 0 && ( 
        <div className="flex justify-center items-center h-full"> 
          {/* Text color for placeholder against card background */}
          <p className="text-slate-500 dark:text-slate-400"> No messages yet. Say hi to Chandler! </p> 
        </div> 
      )}
      {messages.map((msg) => { 
        const adaptedMessage: ChatMessageInterface = { id: msg.id, text: msg.content, sender: msg.role === 'user' ? 'user' : 'character', characterName: msg.role !== 'user' ? 'Chandler' : undefined, };
        return <ChatMessageComponent key={msg.id} message={adaptedMessage} />;
      })}
    </div>
  );
};
export default ChatArea;
