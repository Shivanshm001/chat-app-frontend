"use client";
import { use } from "react";
import { ChatHeader } from "../_utils/ChatHeader";
import { MessageList } from "../_utils/MessageList";
interface PropsI {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: PropsI) {
  const { id } = use(params);
  return (
    <div className="h-screen min-h-screen flex flex-col">
      <ChatHeader />
      <MessageList roomId={id} />
    </div>
  );
}
