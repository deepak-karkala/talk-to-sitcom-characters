// frontend/src/app/page.tsx
import Header from "@/components/common/Header";
import CharacterSelector from "@/components/chat/CharacterSelector";
import ChatArea from "@/components/chat/ChatArea";
import MessageInput from "@/components/chat/MessageInput"; // Updated import

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col">
        <CharacterSelector />
        <ChatArea />
        <MessageInput /> {/* Updated component */}
      </main>
    </div>
  );
}
