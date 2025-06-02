// frontend/src/app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import Header from "@/components/common/Header";
import CharacterSelector from "@/components/chat/CharacterSelector";
import ChatArea from "@/components/chat/ChatArea";
import MessageInput from "@/components/chat/MessageInput";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const getOrCreateSessionId = (): string => {
      let id = sessionStorage.getItem('chatSessionId');
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('chatSessionId', id);
        console.log('New session ID created and stored:', id);
      } else {
        console.log('Existing session ID retrieved:', id);
      }
      return id;
    };
    setSessionId(getOrCreateSessionId());
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading }
    = useChat({
      api: 'http://localhost:8000/api/v1/chat',
      initialMessages: [
        {
          id: 'init_greet_chandler_0',
          role: 'assistant',
          content: "Could I BE any more ready to chat?",
        },
      ],
      body: {
        session_id: sessionId,
      },
    });

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <CharacterSelector />
      <main className="flex-grow container mx-auto px-4 flex flex-col overflow-hidden">
        <ChatArea messages={messages} />
      </main>
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-transparent">
        <div className="container mx-auto px-0 md:px-4">
            <MessageInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              // isLoading={isLoading} // isLoading can be passed if needed
            />
        </div>
      </div>
    </div>
  );
}
