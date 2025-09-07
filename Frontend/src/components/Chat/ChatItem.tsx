// @ts-check

import { AvatarFallback, Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Pin, Users, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Ifriends } from "@/Store/user.store";

export interface IbaseConvo {
  _id: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp?: string;
  };
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface IParticipant {
  userId: string;
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  _id?: string;
}

export interface IgroupChat extends IbaseConvo {
  type: "group";
  participants: IParticipant[]; // User references
  conversationName: string;
}

export interface IdirectChat extends IbaseConvo {
  type: "direct";
  participants: IParticipant[];
  isOnline?: boolean;
  receiverId: string;
  receiverUserName: string;
  avatar?: string;
}

export type ChatUnion = IgroupChat | IdirectChat | (Ifriends & { firstName?: string; lastName?: string });

interface ChatItemProps {
  chat: ChatUnion;
  isSelected: boolean;
  onClick: () => void;
  onRightClick?: (e: React.MouseEvent) => void;
}

export default function ChatItem({ chat, isSelected, onClick, onRightClick }: ChatItemProps) {
  const formatTimestamp = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  };

  const getDisplayName = () => {
    if ('conversationName' in chat && chat.conversationName) return chat.conversationName;
    if ('receiverUserName' in chat && chat.receiverUserName) return chat.receiverUserName;
    if ('userName' in chat) return (chat as Ifriends).userName;
    return '';
  };

  const getFriendFullName = () => {
    if ('userName' in chat && (chat as Ifriends).firstName) {
      return `${(chat as Ifriends).firstName} ${(chat as Ifriends).lastName ?? ''}`.trim();
    }
    return '';
  };

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
            <AvatarImage src={'avatar' in chat && chat.avatar ? chat.avatar : "/placeholder.svg"} />
            <AvatarFallback>{getDisplayName()}</AvatarFallback>
          </Avatar>
          {'isOnline' in chat && chat.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-sidebar rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <h3 className="font-medium text-sidebar-foreground truncate max-w-[120px]" title={getDisplayName()}>{getDisplayName()}</h3>
                  {chat.isPinned && <Pin className="h-3 w-3 text-sidebar-accent flex-shrink-0" />}
                  {chat.isMuted && <VolumeX className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                  {('type' in chat && chat.type === "group") && <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                </div>            <span className="text-xs text-muted-foreground">{formatTimestamp(chat.lastMessage?.timestamp)}</span>
          </div>

          <div className="flex items-center justify-between">
            {chat.lastMessage ? (
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage.content}</p>
            ) : (
              <p className="text-sm text-muted-foreground truncate">{getFriendFullName() || 'Start Conversation'}</p>
            )}
            {chat.unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{chat.unreadCount}</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
