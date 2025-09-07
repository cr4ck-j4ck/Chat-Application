import { AuthProvider, IUser } from "../models/user.model";
import mongoose, { mongo } from "mongoose";

interface IChat {
  type: "direct" | "group";
  participants: Types.ObjectId[]; // User references
  lastMessage: {
    content: string,
    senderId: string,
  },
  createdAt: Date;
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  bio:string;
  avatar?: string;
  provider: AuthProvider;
  password?: string; // optional for social login
  status: "online" | "offline" | "away";
  lastSeen: Date;
  friends: mongoose.Types.ObjectId[]; // References to other users
  friendsRequests: mongoose.Types.ObjectId[]; // References to other users
  blockedUsers: mongoose.Types.ObjectId[];
  socketId?: string;
  chats: mongoose.Types.ObjectId[];
  createdAt: Date;
  userName: string;
  updatedAt: Date;
}

export interface IpopulatedUser extends IUser{
  friends:IUser[];
  friendsRequests:IUser[];
  blockedUsers:IUser[];
  Chats:Chat[];
}

export interface IsentMessage{
  userName:string;
  participants:{
    userId:string
  }[] ,
  conversationId: Types.ObjectId; // Reference to the Chat/Conversation
  senderId: Types.ObjectId; // Reference to User who sent it
  receiverId:Types.ObjectId;
  content: string; // The message text (or JSON for richer types)
  type: "text" | "image" | "file" | "system"; // For extensibility (e.g., future media support)
  readBy: Types.ObjectId[]; // Array of users who have read this message
  createdAt: Date; // Timestamp for sorting and display
}