// @ts-check

import { AvatarFallback, Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Pin, Users, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Ifriends } from "@/Store/user.store";

interface IunreadCount {
  unreadUserId: string;
  count: number;
}

interface Iparticipants {
  userId: string;
}

export interface Chat {
  _id:string;
  type: "direct" | "group";
  conversationName: string;
  participants: Iparticipants[]; // User references
  avatar: string;
  lastMessage: {
    content: string;
    senderId: string;
  };
  isMuted:boolean;
  isPinned:boolean;
  createdAt: Date;
  unreadCount:number
}

interface ChatItemProps {
  chat: Chat | Ifriends;
  isSelected: boolean;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
}

export default function ChatItem({
  chat,
  isSelected,
  onClick,
  onRightClick,
}: ChatItemProps) {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sidebar-accent/10 ${
        isSelected ? "bg-sidebar-accent/20 border border-sidebar-accent/30" : ""
      }`}
      onClick={onClick}
      onContextMenu={onRightClick}
    >
      <div className="flex items-center space-x-3">
        <div className="relative h-12 w-12 rounded-full flex justify-center items-center bg-[#ececec]">
          <Avatar>
            <AvatarImage src={chat.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {chat.firstName[0].concat(chat.lastName[0])}
            </AvatarFallback>
          </Avatar>
          {chat.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-sidebar rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-sidebar-foreground truncate">
                {chat.firstName} {chat.lastName}
              </h3>
              {chat.isPinned && <Pin className="h-3 w-3 text-sidebar-accent" />}
              {chat.isMuted && (
                <VolumeX className="h-3 w-3 text-muted-foreground" />
              )}
              {chat.type === "group" && (
                <Users className="h-3 w-3 text-muted-foreground" />
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              {chat.timestamp}
            </span>
          </div>
          <div className="flex items-center justify-between">
            {chat.lastMessage ? 
            <p className="text-sm text-muted-foreground truncate">
              {chat.lastMessage}
            </p>
            : 
            <p className="text-sm text-muted-foreground truncate">
              Start Conversation with {chat.firstName.concat(" ",chat.lastName)}
            </p>
            }
            {chat.unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {chat.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
