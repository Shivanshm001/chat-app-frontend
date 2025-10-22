import { SVGProps } from "react";
import { AxiosResponse } from "axios";
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

interface PaginationI {
  page: number;
  limit: number;
  totalCount: number;
  count: number;
}

export interface APIResponseI<T = any> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  pagination?: PaginationI;
  error?: any;
}

export type APIResponseT<T = any> = AxiosResponse<APIResponseI<T>>
export interface PendingRequestAPIResponse {
  incoming: FriendRequestIncomingI[];
  outgoing: FriendRequestOutgoingI[];
};

export interface FriendRequestIncomingI {
  _id: string;
  requester: {
    _id: string;
    username: string;
    avatar?: string;
    email: string;
  };
  recipient: string;
  status: 'pending' | 'accepted' | 'rejected'; // assuming possible states
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface FriendAPIResponse {
  _id: string; // friend user id OR room id (for group)
  username?: string;
  name?: string; // group name
  email?: string;
  avatar?: string | null;
  roomId?: string | null;
  isGroup?: boolean;
  participantsCount?: number;
  participantsPreview?: string[]; // array of usernames
  lastMessage?: {
    _id?: string;
    content?: string;
    senderId?: string;
    senderName?: string;
    createdAt?: string;
  } | null;
  unreadCount?: number;
  lastInteractedAt?: string | null;
  isOnline?: boolean;
}

export interface FriendRequestOutgoingI {
  _id: string,
  requester: string,
  recipient: {
    _id: string,
    avatar?: string;
    username: string,
    email: string
  },
  status: "pending" | "accepted" | "rejected",
  createdAt: string,
  updatedAt: string,
  __v: number
}