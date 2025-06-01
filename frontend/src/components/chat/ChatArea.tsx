// frontend/src/components/chat/ChatArea.tsx
"use client"; // If we plan to update messages dynamically later, mark as client component

import React from 'react';
import ChatMessage, { Message } from './ChatMessage';

// Hardcoded messages for initial display
const initialMessages: Message[] = [
  { id: '1', text: "Could I BE any more ready to chat?", sender: 'character', characterName: 'Chandler' },
  { id: '2', text: "Hey Chandler! What's new?", sender: 'user' },
  { id: '3', text: "Oh, you know... sarcasm, mostly. And this new thing where I talk to people through a computer. It's very... 21st century.", sender: 'character', characterName: 'Chandler' },
];

const ChatArea = () => {
  // In future steps, messages will come from props or a hook (useChat)
  const messages = initialMessages;

  return (
    <div className="flex-grow bg-white dark:bg-gray-700 p-4 my-4 rounded-md shadow overflow-y-auto h-[calc(100vh-300px)] md:h-[calc(100vh-280px)]">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {/* Typing indicator can be added here later */}
    </div>
  );
};

export default ChatArea;
