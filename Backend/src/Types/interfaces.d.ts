import { AuthProvider } from "../models/user.model";
import mongoose, { Types } from "mongoose";

// Consolidated User interface
export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  avatar?: string;
  provider: AuthProvider;
  password?: string;
  status: "online" | "offline" | "away";
  lastSeen: Date;
  friends: mongoose.Types.ObjectId[];
  friendsRequests: mongoose.Types.ObjectId[];
  blockedUsers: mongoose.Types.ObjectId[];
  socketId?: string;
  chats: mongoose.Types.ObjectId[];
  createdAt: Date;
  userName: string;
  updatedAt: Date;
}

export interface IpopulatedUser extends IUser {
  friends: IUser[];
  friendsRequests: IUser[];
  blockedUsers: IUser[];
  chats: mongoose.Types.ObjectId[];
}

// Fixed message interface with proper types
export interface IsentMessage {
  conversationId?: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId?: Types.ObjectId;
  content: string;
  type?: "text" | "image" | "file" | "system";
}

// Conversation interface
export interface IConversation {
  type: "direct" | "group";
  participants: {
    userId: Types.ObjectId;
    isMuted?: boolean;
    isPinned?: boolean;
    unreadCount?: number;
  }[];
  conversationName?: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Friend request interface
export interface IFriendRequest {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
