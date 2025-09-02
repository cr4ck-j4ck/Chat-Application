import { AuthProvider, IUser } from "../models/user.model";
import mongoose from "mongoose";


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
  chats: string[] | null;
  createdAt: Date;
  userName: string;
  updatedAt: Date;
}

export interface IpopulatedUser extends IUser{
  friends:IUser[];
  friendsRequests:IUser[];
  blockedUsers:IUser[];
}