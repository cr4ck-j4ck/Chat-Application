// src/components/chat/ChatHeader.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getChatDisplayName, getChatAvatar, getChatAvatarFallback } from '@/Types/chat.types';
import type { ChatUnion } from '@/Types/chat.types';

interface ChatHeaderProps {
  selectedChat: ChatUnion;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedChat }) => {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={getChatAvatar(selectedChat)} />
          <AvatarFallback>
            {getChatAvatarFallback(selectedChat)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">
            {getChatDisplayName(selectedChat)}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;