"use client";

import { express } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, Search, Settings, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useAppDispatch } from "@/redux/hooks";
import { setCurrentConversation } from "@/redux/slices/conversationSlice";
import { FriendAPIResponse } from "@/types";



export default function ChatLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;

  // Fetch enriched friends + groups
  async function fetchFriendsList() {
    const response = await express.get("/friends"); // uses your new static
    return response.data.data as FriendAPIResponse[];
  }

  const {
    data: friends,
    isLoading,
    error,
  } = useQuery<FriendAPIResponse[]>({
    queryKey: ["friendsWithMeta"],
    queryFn: fetchFriendsList,
    refetchOnWindowFocus: true,
  });

  // derive selected id from URL (assumes /chat/[id])
  const selectedId = useMemo(() => {
    const parts = pathname?.split("/") ?? [];
    const idx = parts.indexOf("chat");
    if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
    return null;
  }, [pathname]);

  const formatTime = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "";
  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">
                Chats
              </h2>
            </div>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          )}
          {error && (
            <div className="p-4 text-sm text-destructive">Failed to load</div>
          )}

          {!isLoading && (!friends || friends.length === 0) && (
            <div className="p-4 text-sm text-muted-foreground">
              No conversations
            </div>
          )}

          {friends?.map((item) => {
            // displayName & avatar selection
            const displayName = item.isGroup
              ? item.name ?? "Group"
              : item.username ?? "User";
            const avatar =
              item.avatar ??
              (item.isGroup
                ? `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
                    displayName
                  )}`
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    displayName
                  )}`);

            // choose the id used for routing: prefer roomId (if exists) else fallback to friend user id

            const lastMsg = item.lastMessage?.content ?? "";
            const lastMsgTime = item.lastMessage?.createdAt
              ? formatTime(item.lastMessage.createdAt)
              : "";

            return (
              <div
                key={item._id + (item.isGroup ? "-g" : "-p")}
                onClick={() => {
                  console.log("Running dispatch for conversation with roomId", item.roomId)
                  dispatch(
                    setCurrentConversation({
                      avatar: item.avatar ?? "",
                      id: item.roomId ?? "",
                      lastMessage: item.lastMessage?.content ?? "",
                      lastMessageTime: item.lastInteractedAt ?? undefined,
                      name: item.name || item.username,
                      type: item.isGroup ? "group" : "private",
                      unread: item.unreadCount,
                    })
                  );

                  router.push(`/chat/${item.roomId}`)
                }}
                className={`w-full  p-4 flex items-start gap-3 hover:bg-sidebar-accent transition-colors border-b border-sidebar-border ${
                  selectedId === item.roomId ? "bg-sidebar-accent" : ""
                }`}
              >
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>
                    {(displayName && displayName[0]) ?? "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sidebar-foreground truncate flex items-center gap-2">
                      {displayName}
                      {item.isGroup && (
                        <Users className="w-3 h-3 text-muted-foreground" />
                      )}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {lastMsgTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {item.isGroup && item.participantsPreview?.length
                        ? `${item.participantsPreview.slice(0, 3).join(", ")}${
                            item.participantsCount &&
                            item.participantsCount! > 3
                              ? ` +${item.participantsCount! - 3}`
                              : ""
                          }`
                        : lastMsg}
                    </p>

                    {item.unreadCount && item.unreadCount > 0 && (
                      <Badge className="ml-2 bg-primary text-primary-foreground">
                        {item.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content (chat pages) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
