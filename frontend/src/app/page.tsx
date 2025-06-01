// frontend/src/app/page.tsx
"use client";

import { useEffect, useState } from 'react'; // Import useEffect and useState
import { useChat } from 'ai/react';
import Header from "@/components/common/Header";
import CharacterSelector from "@/components/chat/CharacterSelector";
import ChatArea from "@/components/chat/ChatArea";
import MessageInput from "@/components/chat/MessageInput";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Function to get or create session ID
    const getOrCreateSessionId = (): string => {
      let currentSessionId = sessionStorage.getItem('chatSessionId');
      if (!currentSessionId) {
        currentSessionId = crypto.randomUUID();
        sessionStorage.setItem('chatSessionId', currentSessionId);
        console.log('New session ID created and stored:', currentSessionId);
      } else {
        console.log('Existing session ID retrieved:', currentSessionId);
      }
      return currentSessionId;
    };

    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []); // Empty dependency array ensures this runs only once on mount

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
      body: { // Add the body option to include session_id
        session_id: sessionId, // Pass the current session ID
        // image_context_notes will be added here later if an image is uploaded
      },
      // Only send the request if sessionId is available
      // The useChat hook internally might wait for body to be fully populated if some values are initially null.
      // Or, one could conditionally render the chat interface / disable sending until sessionId is set.
      // For now, relying on useChat's behavior. If sessionId is null initially, it might send null.
      // Backend should handle a null session_id by assigning a default or erroring if required.
    });

  // Optional: Conditionally render chat only when sessionId is available to prevent premature calls
  // if (!sessionId) {
  //   return <div>Loading session...</div>;
  // }

  return (
    // Main page container - ensure this has a contrasting background
    // The body tag in layout.tsx already sets bg-gray-100 dark:bg-gray-900.
    // We can override it here for the specific chat page view if needed, or ensure MessageInput's wrapper is different.
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-chat-bg-dark"> {/* Updated page background */}
      <Header />
      <CharacterSelector />
      <main className="flex-grow container mx-auto px-4 flex flex-col overflow-hidden">
        <ChatArea messages={messages} />
      </main>

      {/* Wrapper for MessageInput - this needs a distinct background for shadow to pop */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-transparent"> {/* Make wrapper transparent */}
        <div className="container mx-auto px-0 md:px-4"> {/* Inner container for padding */}
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
