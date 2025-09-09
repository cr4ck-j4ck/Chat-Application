// src/components/ChatPage.tsx
import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import useCommunicationStore from '@/Store/communication.store';
import useGlobalStore from '@/Store/global.store';
import useUserStore from '@/Store/user.store';
import type { IMessage } from '@/Store/communication.store';
import type { ChatUnion } from '@/Types/chat.types';
import { isDirectChat, isFriendChat } from '@/Types/chat.types';
import ChatSidebar from '@/components/Chat/ChatSideBar';
import ChatArea from '@/components/Chat/ChatArea';
import ContextMenu from '@/components/Chat/ContextMenu';
import AddFriendDialog from '@/components/Chat/AddFriendDialog';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useConversations } from '@/hooks/useConversation';

const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatUnion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chatId: string;
    chatType: "group" | "direct";
  } | null>(null);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  
  const { directConversations, setDirectConversations, appendMessage } = useCommunicationStore(
    useShallow((state) => ({
      directConversations: state.directConversations,
      setDirectConversations: state.setDirectConversations,
      appendMessage: state.appendMessage
    }))
  );
  
  const user = useUserStore((state) => state.user);
  const socket = useGlobalStore((state) => state.socket);
  const { idParameter } = useConversations();
  const { isSending, handleSendMessage } = useSendMessage(selectedChat);

  // Handle real-time updates and notifications
  useEffect(() => {
    if (!socket || !user) return;
    
    const handleNewMessage = (data: IMessage) => {
      const isCurrentChat = selectedChat && (
        (isDirectChat(selectedChat) && selectedChat._id === data.conversationId) ||
        (isFriendChat(selectedChat) && directConversations.some(c =>
          isDirectChat(c) && c.receiverId === selectedChat._id && c._id === data.conversationId
        ))
      );
      
      if (isCurrentChat) {
        appendMessage(data);
      } else {
        const senderConversation = directConversations.find(c =>
          c._id === data.conversationId
        );
        
        if (senderConversation && data.senderId !== user._id) {
          const senderName = isDirectChat(senderConversation)
            ? senderConversation.receiverUserName ||
              `${senderConversation.receiverFirstName || ''} ${senderConversation.receiverLastName || ''}`.trim()
            : 'Someone';
          
          toast(`New message from ${senderName}`, {
            description: data.content,
            action: {
              label: "View",
              onClick: () => setSelectedChat(senderConversation)
            }
          });
        }
        
        setDirectConversations(prevConversations => {
          const updatedConvos = prevConversations.map(conv => {
            if (conv._id === data.conversationId) {
              return {
                ...conv,
                lastMessage: {
                  content: data.content,
                  senderId: data.senderId,
                  timestamp: new Date().toISOString()
                },
                unreadCount: conv.unreadCount + (data.senderId !== user._id ? 1 : 0)
              };
            }
            return conv;
          });
          
          return [...updatedConvos].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            const aTime = a.lastMessage?.timestamp || new Date().toISOString();
            const bTime = b.lastMessage?.timestamp || new Date().toISOString();
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
        });
      }
    };
    
    socket.on("receive_message", handleNewMessage);
    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, user, selectedChat, appendMessage, directConversations, setDirectConversations]);

  // Handle ID parameter from URL
  useEffect(() => {
    if (!idParameter || !user || !directConversations.length) return;
    
    const selectedConvo = directConversations.find(c =>
      c._id === idParameter ||
      (c.type === "direct" && c.receiverId === idParameter)
    );
    
    if (selectedConvo) {
      setSelectedChat(selectedConvo);
    } else {
      const friend = user.friends.find(f => f._id === idParameter);
      if (friend) {
        const friendChat = {
          _id: friend._id,
          firstName: friend.firstName,
          lastName: friend.lastName,
          userName: friend.userName,
          avatar: friend.avatar,
          isOnline: false,
          isPinned: false,
          isMuted: false,
          unreadCount: 0,
          type: "direct" as const
        };
        setSelectedChat(friendChat);
      }
    }
  }, [idParameter, user, directConversations]);

  // Clear unread count when chat is selected
  useEffect(() => {
    if (!selectedChat || !isDirectChat(selectedChat)) return;
    
    setDirectConversations(prevConversations =>
      prevConversations.map(conv => {
        if (conv._id === selectedChat._id) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      })
    );
  }, [selectedChat, setDirectConversations]);

  const handleRightClick = (
    e: React.MouseEvent,
    chatId: string,
    chatType: "group" | "direct"
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      chatId,
      chatType,
    });
  };

  const handleSendMessageWrapper = () => {
    handleSendMessage(newMessage, setNewMessage);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        handleRightClick={handleRightClick}
      />
      
      <ChatArea
        selectedChat={selectedChat}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        isSendingMessage={isSending}
        handleSendMessage={handleSendMessageWrapper}
        setIsAddFriendOpen={setIsAddFriendOpen}
      />
      
      <ContextMenu 
        contextMenu={contextMenu} 
        setContextMenu={setContextMenu} 
      />
      
      <AddFriendDialog />
      <Toaster />
    </div>
  );
};

export default ChatPage;