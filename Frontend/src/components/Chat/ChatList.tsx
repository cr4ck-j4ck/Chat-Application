// src/components/chat/ChatList.tsx
import React from 'react';
import { Pin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import useUserStore from '@/Store/user.store';
import { useConversations } from '@/hooks/useConversation';
import { 
  getChatDisplayName, 
  getChatAvatar, 
  getChatAvatarFallback 
} from '@/Types/chat.types';
import type { ChatUnion } from '@/Types/chat.types';

interface ChatListProps {
  searchQuery: string;
  selectedChat?: ChatUnion | null;
  setSelectedChat: (chat: ChatUnion) => void;
  handleRightClick?: (e: React.MouseEvent, chatId: string, chatType: "group" | "direct") => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  searchQuery, 
  selectedChat, 
  setSelectedChat,
  handleRightClick 
}) => {
  const user = useUserStore((state) => state.user);
  const { isLoading, directConversations } = useConversations();
    console.log("mere mein error aa rah ihai ")
  let filteredFriends: any[] = [];
  
  if (searchQuery && user?.friends) {
    filteredFriends = user.friends.filter((friend) =>
      !directConversations.some((dc) => dc.receiverId === friend._id) &&
      (friend.firstName || "")
        .concat(" ", friend.lastName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="space-y-2">
      {searchQuery && filteredFriends.length > 0 && (
        <div className="p-2">
          <h3 className="text-sm font-medium mb-2">Suggested Friends</h3>
          {filteredFriends.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b relative"
              onClick={() => setSelectedChat(friend)}
            >
              <Avatar>
                <AvatarImage src={friend.avatar} />
                <AvatarFallback>
                  {friend.firstName?.[0]}
                  {friend.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {friend.firstName} {friend.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {friend.userName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium p-2">Chats</h3>
        {isLoading ? (
          <div className="p-4">
            <LoadingSpinner size="sm" text="Loading conversations..." />
          </div>
        ) : (
          directConversations
            .filter(chat => 
              !searchQuery || 
              chat.receiverUserName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
            .map((chat) => (
              <div
                key={chat._id}
                className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b relative ${
                  selectedChat?._id === chat._id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
                onContextMenu={(e) => handleRightClick?.(e, chat._id, "direct")}
              >
                <Avatar>
                  <AvatarImage src={getChatAvatar(chat)} />
                  <AvatarFallback>
                    {getChatAvatarFallback(chat)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium truncate">
                      {getChatDisplayName(chat)}
                    </p>
                    {chat.isPinned && (
                      <Pin className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {chat.unreadCount}
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ChatList;