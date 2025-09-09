// src/components/chat/ChatSidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useUserStore from '@/Store/user.store';
import ChatList from '@/components/Chat/ChatList';
import type { ChatUnion } from '@/Types/chat.types';

interface ChatSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedChat?: ChatUnion | null;
  setSelectedChat: (chat: ChatUnion) => void;
  handleRightClick?: (e: React.MouseEvent, chatId: string, chatType: "group" | "direct") => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedChat,
  setSelectedChat,
  handleRightClick
}) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  return (
    <div className="w-1/4 border-r bg-background overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className="shrink-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
      
      <ChatList
        searchQuery={searchQuery}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        handleRightClick={handleRightClick}
      />
    </div>
  );
};

export default ChatSidebar;