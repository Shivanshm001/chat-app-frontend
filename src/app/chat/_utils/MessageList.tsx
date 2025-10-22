import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import z from "zod";
import { useAppSelector } from "@/redux/hooks";
import { socket } from "@/lib/socket.io-client";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const messageSchema = z.object({
  message: z.string().min(1),
});
type MessageT = z.infer<typeof messageSchema>;

interface ChatMessage {
  id: string;
  content: string;
  senderId?: string | "me";
  senderName?: string;
  senderAvatar?: string | null;
  timestamp?: Date;
}

export function MessageList({ roomId }: { roomId: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // this ref must live inside the scrollable messages container
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const user = useAppSelector((state) => state.user.user);
  if (!user) return <p>Loading...</p>;
  const userId = user._id;

  const { register, handleSubmit, reset } = useForm<MessageT>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Helper to normalize incoming message shapes from backend
  const normalizeMessage = (m: any): ChatMessage => {
    const id = m.id ?? m._id ?? Math.random().toString(36).slice(2);
    const content = m.content ?? m.message ?? m.text ?? "";
    const senderIdRaw = m.sender?._id ?? m.senderId ?? m.from?._id ?? m.sender;
    const senderId = senderIdRaw
      ? senderIdRaw.toString() === userId?.toString()
        ? "me"
        : senderIdRaw.toString()
      : undefined;
    const senderName =
      m.sender?.name ?? m.senderName ?? m.from?.name ?? (senderId === "me" ? user.name : "Unknown");
    const senderAvatar =
      m.sender?.avatar ?? m.senderAvatar ?? m.from?.avatar ?? null;
    const timestamp = m.createdAt
      ? new Date(m.createdAt)
      : m.timestamp
      ? new Date(m.timestamp)
      : new Date();

    return {
      id,
      content,
      senderId,
      senderName,
      senderAvatar,
      timestamp,
    };
  };

  // Submit handler — optimistic UI + emit
  async function onSubmit(data: MessageT) {
    if (!data.message.trim() || !roomId) return;

    const tempId = Math.random().toString(36).slice(2);
    const optimistic: ChatMessage = {
      id: tempId,
      content: data.message,
      senderId: "me",
      senderName: user?.name || user?.username,
      senderAvatar: user?.avatar ?? null,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, optimistic]);

    // emit same event name as old code
    socket.emit("sendMessage", { roomId, content: data.message });

    reset();
  }

  useEffect(() => {
    if (!roomId) return;

    console.log("Socket effect triggered for room:", roomId);
    if (!socket.connected) {
      socket.connect();
      console.log("Socket connected:", socket.connected);
    }

    // Join the requested room
    socket.emit("joinRoom", roomId);

    // previousMessages — map to our shape
    const previousHandler = (_messages: any[]) => {
      if (!Array.isArray(_messages)) return;
      const normalized = _messages.map((m) => normalizeMessage(m));
      setMessages(normalized);
    };
    socket.on("previousMessages", previousHandler);

    // receiveMessage (correct spelling)
    const receiveHandler = (msg: any) => {
      const id = msg.id ?? msg._id;
      setMessages((prev) => {
        // avoid duplicates
        if (id && prev.some((m) => m.id === id)) return prev;

        // ignore messages that originated from this user (we already added optimistic)
        const senderIdRaw = msg.sender?._id ?? msg.senderId ?? msg.sender;
        if (senderIdRaw && senderIdRaw.toString() === userId?.toString()) {
          return prev;
        }

        return [...prev, normalizeMessage(msg)];
      });
    };
    socket.on("receiveMessage", receiveHandler);

    // reciveMessage — keep for backward compatibility with typo'd event
    socket.on("reciveMessage", receiveHandler);

    // cleanup when leaving room or component unmounts
    return () => {
      try {
        socket.emit("leaveRoom", roomId);
      } catch (e) {
        /* ignore */
      }
      socket.off("previousMessages", previousHandler);
      socket.off("receiveMessage", receiveHandler);
      socket.off("reciveMessage", receiveHandler);
    };
  }, [roomId, userId]);

  // scroll to bottom on new messages — messagesEndRef is inside the scrollable area
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date?: Date) => {
    const dt = date ?? new Date();
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(dt);
  };

  return (
    // make this component a column flex container so the message list can scroll and the input stays put
    <div className="flex-1 flex flex-col h-full">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
        {messages.map((message) => {
          const isMe = message.senderId === "me";

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={message.senderAvatar ?? undefined} />
                <AvatarFallback>{(message.senderName ?? "U")[0]}</AvatarFallback>
              </Avatar>

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-md`}>
                {!isMe && (
                  <span className="text-xs font-medium text-muted-foreground mb-1">
                    {message.senderName}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          );
        })}

        {/* anchor for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — outside the scrollable area, so it stays fixed at bottom */}
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon">
            <Smile className="w-5 h-5" />
          </Button>

          <Input {...register("message")} placeholder="Type a message..." className="flex-1" />

          <Button type="submit" size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
