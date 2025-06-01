// frontend/src/app/page.tsx
"use client"; // Required because useChat is a hook

import { useChat } from 'ai/react';
import Header from "@/components/common/Header";
import CharacterSelector from "@/components/chat/CharacterSelector";
import ChatArea from "@/components/chat/ChatArea";
import MessageInput from "@/components/chat/MessageInput";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading }
    = useChat({
      api: 'http://localhost:8000/api/v1/chat', // Updated to FastAPI backend URL
      // Optional: initialMessages: [{ id: '0', role: 'system', content: 'You are Chandler Bing...'}]
    });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col">
        <CharacterSelector />
        <ChatArea messages={messages} /* isLoading={isLoading} */ />
        <MessageInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          // isLoading={isLoading}
        />
      </main>
    </div>
  );
}
