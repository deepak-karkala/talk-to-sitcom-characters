// frontend/src/app/page.tsx
"use client";

import { useChat } from 'ai/react';
import Header from "@/components/common/Header";
import CharacterSelector from "@/components/chat/CharacterSelector";
import ChatArea from "@/components/chat/ChatArea";
import MessageInput from "@/components/chat/MessageInput";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading }
    = useChat({
      api: 'http://localhost:8000/api/v1/chat',
      initialMessages: [ // Added initialMessages
        {
          id: 'init_greet_chandler_0', // Unique ID for the initial message
          role: 'assistant', // 'assistant' role for AI/character messages
          content: "Could I BE any more ready to chat?",
        },
      ],
    });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800">
      <Header />
      <CharacterSelector />

      <main className="flex-grow container mx-auto px-4 flex flex-col overflow-hidden">
        <ChatArea messages={messages} />
      </main>

      <div className="sticky bottom-0 left-0 right-0 z-10 bg-gray-50 dark:bg-gray-800 container mx-auto px-0 md:px-4">
        <MessageInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          // isLoading={isLoading}
        />
      </div>
    </div>
  );
}
