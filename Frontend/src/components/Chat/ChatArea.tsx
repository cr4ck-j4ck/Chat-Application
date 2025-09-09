// src/components/chat/ChatArea.tsx
import React from 'react';
import ChatHeader from '@/components/Chat/ChatHeader';
import MessageList from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';
import type { ChatUnion } from '@/Types/chat.types';

interface ChatAreaProps {
  selectedChat: ChatUnion | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSendingMessage: boolean;
  handleSendMessage: () => void;
  setIsAddFriendOpen: (open: boolean) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedChat,
  newMessage,
  setNewMessage,
  isSendingMessage,
  handleSendMessage,
  setIsAddFriendOpen
}) => {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
          <p className="text-muted-foreground mb-4">
            Select a chat to start messaging
          </p>
          <button 
            onClick={() => setIsAddFriendOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Start a new chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <ChatHeader selectedChat={selectedChat} />
      <MessageList selectedChat={selectedChat} />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        isSendingMessage={isSendingMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatArea;