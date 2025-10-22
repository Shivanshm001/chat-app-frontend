"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { express } from "@/lib/axios";
import { useApiErrorHandler } from "@/lib/hooks/useApiErrorHandler";
import { addtoast } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";

async function searchUserFn({ username }: { username: string }) {
  try {
    if (!username || username.trim() === "")
      return {
        users: [],
      };
    const response = await express.get("/search", {
      params: {
        username,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error searching users : ", { error });
    throw error;
  }
}

async function sendRequestFn({ username }: { username: string }) {
  try {
    const response = await express.post("/friends/request", {
      requestedTo: username,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
export default function SearchUser({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string>("");
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const handleAPIError = useApiErrorHandler();

  const search = useQuery({
    queryKey: ["requests", username],
    queryFn: () => searchUserFn({ username }),
    retry: true,
    enabled: username.trim().length > 0,
  });

  useEffect(() => {
    if (search.isSuccess && search.data?.users) {
      setSearchedUsers(search.data?.users);
    }
  }, [search.isSuccess, search.data]);
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="text-center text-2xl">Add a friend</DrawerTitle>
        <DrawerHeader>
          <form className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              onChange={(e) => {
                const value = e.target.value;
                setUsername(value);
                if (value.trim() === "") setSearchedUsers([]);
              }}
              placeholder="Search users..."
              className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </form>
        </DrawerHeader>
        <div className="m-8">
          {searchedUsers &&
            searchedUsers.length > 0 &&
            searchedUsers.map((user) => {
              return <UserCard {...user} />;
            })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function UserCard({
  _id,
  avatar,
  username,
}: {
  _id: string;
  avatar: string;
  username: string;
}) {
  const handleAPIError = useApiErrorHandler();
  const sendRequest = useMutation({
    mutationKey: ["requests", "friends"],
    mutationFn: sendRequestFn,
    onSuccess: (data) => {
      addtoast({
        title: "Request Sent",
        description: data.username,
      });
    },
    onError: (error) => {
      handleAPIError(error);
    },
  });
  return (
    <div
      key={_id}
      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <Avatar className="w-14 h-14">
        <AvatarImage src={avatar} />
        <AvatarFallback>{username}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{username}</h3>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() =>
            sendRequest.mutate({
              username: username,
            })
          }
          className="gap-1 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Friend
        </Button>
      </div>
    </div>
  );
}
