"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { express } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
    APIResponseI,
    FriendRequestIncomingI,
    FriendRequestOutgoingI,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchUser from "./_components/SearchUser";

const Requests = () => {
  const [incoming, setIncoming] = useState<FriendRequestIncomingI[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestOutgoingI[]>([]);

  async function fetchRequests() {
    interface ResponseI {
      incoming: FriendRequestIncomingI[];
      outgoing: FriendRequestOutgoingI[];
    }
    try {
      const response = await express.get<APIResponseI<ResponseI>>(
        "/friends/requests"
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async function takeRequestAction({
    requestId,
    action,
  }: {
    requestId: string;
    action: "accept" | "reject";
  }) {
    try {
      const response = await express.patch(`/friends/request/${requestId}`, {
        action,
      });
      return response.data;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  }

  const pendingRequests = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
    retry: true,
    refetchOnMount: true,
  });

  const requestAction = useMutation({
    mutationKey: ["requests", "friends"],
    mutationFn: takeRequestAction,
    onSuccess: () => {
      pendingRequests.refetch(); // Refresh requests after an action
    },
  });

  useEffect(() => {
    const { data, isSuccess } = pendingRequests;
    if (isSuccess && data?.incoming && data?.outgoing) {
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    }
  }, [pendingRequests.isSuccess, pendingRequests.data]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
          <div className="flex items-center gap-4 p-4">
            <Link href="/chat">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Friend Requests
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your friend requests
              </p>
            </div>
          </div>
          <div>
            <SearchUser>
              <Button>Add a friend</Button>
            </SearchUser>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4">
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="received" className="relative">
                Received
                {incoming && incoming.length > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {incoming.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent
                {outgoing && outgoing.length > 0 && (
                  <Badge className="ml-2 bg-muted text-muted-foreground">
                    {outgoing.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4">
              {incoming && incoming.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                incoming.map(({ requester, createdAt, _id }) => (
                  <div
                    key={_id}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={requester?.avatar} />
                      <AvatarFallback>{requester.username}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {requester.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        color="success"
                        size="sm"
                        onClick={() =>
                          requestAction.mutate({
                            action: "accept",
                            requestId: _id,
                          })
                        }
                        className="gap-1 cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          requestAction.mutate({
                            action: "reject",
                            requestId: _id,
                          })
                        }
                        className="gap-1 cursor-pointer active:scale-95"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {outgoing && outgoing.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No sent requests</p>
                </div>
              ) : (
                outgoing.map(({ _id, recipient, createdAt }) => (
                  <div
                    key={_id}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
                  >
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={recipient.avatar} />
                      <AvatarFallback>{recipient.username}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {recipient.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(createdAt)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() =>
                        requestAction.mutate({
                          action: "reject",
                          requestId: _id,
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Requests;
