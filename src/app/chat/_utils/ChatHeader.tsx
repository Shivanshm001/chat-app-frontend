"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { MoreVertical, Phone, Users, Video } from "lucide-react";

export function ChatHeader(){
  const conversation = useAppSelector((state) => state.conversation);
  return (
    <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback>{conversation.name}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            {conversation.name}
            {conversation.type === "group" && (
              <Users className="w-4 h-4 text-muted-foreground" />
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            {conversation.type === "group" ? "5 members" : "Active now"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
