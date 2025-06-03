// frontend/src/app/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useChat, Message as VercelAIMessage } from 'ai/react';
import Header from "@/components/common/Header";
import CharacterSelector from "@/components/chat/CharacterSelector";
import ChatArea from "@/components/chat/ChatArea";
import MessageInput from "@/components/chat/MessageInput";
import { Message as CustomMessage } from '@/components/chat/ChatMessage';

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // New state for preview URL

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
    if (typeof window !== 'undefined') {
      setSessionId(getOrCreateSessionId());
    }

    // Cleanup for imagePreviewUrl
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, []); // imagePreviewUrl removed from dependency array to only run on mount/unmount for session ID logic, separate effect for URL cleanup

  // Effect for managing imagePreviewUrl lifecycle
  useEffect(() => {
    let currentUrl = imagePreviewUrl;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
        console.log("Revoked object URL (on unmount or change):", currentUrl);
      }
    };
  }, [imagePreviewUrl]); // Runs when imagePreviewUrl changes or component unmounts


  const { 
    messages: vercelMessages, 
    input, 
    handleInputChange, 
    handleSubmit: originalHandleSubmit,
    isLoading 
  } = useChat({
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imagePreviewUrl) { // Revoke old URL if one exists
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Image selected:", file.name);
      setImageFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(newPreviewUrl);
      console.log("Created object URL:", newPreviewUrl);
      e.target.value = ""; // Clear file input value to allow re-selection of the same file
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      console.log("Revoked object URL (on remove):", imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    // Note: Clearing the file input element itself is tricky from here if the ref is in MessageInput.
    // For now, handleFileChange already clears it after selection.
    // If a user removes, then re-selects the *same* file, it should still trigger onChange.
  };

  const guardedHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sessionId) {
      console.warn("handleSubmit blocked: sessionId is not yet available.");
      return;
    }
    if (!input.trim() && !imageFile) { // Prevent submission if both are empty
        console.warn("handleSubmit blocked: input and image are empty.");
        return;
    }
    console.log(
      "Calling originalHandleSubmit. Current input:", input, 
      "Session ID:", sessionId, 
      "Is Loading:", isLoading,
      "Image selected:", imageFile?.name
    );
    // TODO: Actual image sending logic
    originalHandleSubmit(e); 
    // Clear input and image after submission attempt
    if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const adaptedMessages: CustomMessage[] = useMemo(() => {
    return vercelMessages.map((msg: VercelAIMessage): CustomMessage => ({
      id: msg.id,
      text: msg.content,
      sender: msg.role === 'user' ? 'user' : 'character',
      characterName: msg.role === 'assistant' ? 'Chandler' : undefined,
    }));
  }, [vercelMessages]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <CharacterSelector />
      <main className="flex-grow container mx-auto px-4 flex flex-col overflow-hidden">
        <ChatArea messages={adaptedMessages} isLoading={isLoading} error={null} />
      </main>
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-transparent">
        <div className="container mx-auto px-0 md:px-4">
            <MessageInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={guardedHandleSubmit}
              handleFileChange={handleFileChange}
              imagePreviewUrl={imagePreviewUrl} // Pass new state
              onRemoveImage={handleRemoveImage}   // Pass new handler
            />
        </div>
      </div>
    </div>
  );
}

