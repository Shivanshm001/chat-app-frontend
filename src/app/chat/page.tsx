import { ChatHeader } from "./_utils/ChatHeader";

export default function ChatIndexPage() {
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader />

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            No conversation selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a conversation from the left to start chatting.
          </p>
        </div>
      </div>
    </div>
  );
}
