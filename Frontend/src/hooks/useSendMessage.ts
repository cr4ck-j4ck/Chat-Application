// src/hooks/useSendMessage.ts
import { useState } from 'react';
import { toast } from 'sonner';
import useCommunicationStore from '@/Store/communication.store';
import useUserStore from '@/Store/user.store';
import useGlobalStore from '@/Store/global.store';
import { sendDirectMessage } from '@/Services/sendMessage.socket';
import type { ChatUnion } from '@/Types/chat.types';
import { isDirectChat, isFriendChat, isGroupChat } from '@/Types/chat.types';

export const useSendMessage = (selectedChat: ChatUnion | null) => {
  const [isSending, setIsSending] = useState(false);
  const user = useUserStore((state) => state.user);
  const socket = useGlobalStore((state) => state.socket);
  const  directConversations  = useCommunicationStore(state => state.directConversations);

  const handleSendMessage = async (newMessage: string, setNewMessage: (msg: string) => void) => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !selectedChat || !socket || !user) {
      if (!socket) toast.error("Connection lost. Please refresh the page.");
      if (!user) toast.error("Please log in to send messages.");
      if (!selectedChat) toast.error("Please select a chat first.");
      return;
    }

    try {
      setIsSending(true);
      
      type SendPayload = { 
        content: string; 
        senderId: string; 
        receiverId?: string; 
        conversationId?: string; 
        type?: "text" | "image" | "file" | "system" 
      };
      
      const payload: SendPayload = { 
        content: trimmedMessage, 
        senderId: user._id, 
        type: "text" 
      };
      
      if (isFriendChat(selectedChat)) {
        const existingConvo = directConversations.find(
          c => isDirectChat(c) && c.receiverId === selectedChat._id
        );
        
        if (existingConvo) {
          payload.conversationId = existingConvo._id;
        } else {
          payload.receiverId = selectedChat._id;
        }
      } else if (isDirectChat(selectedChat)) {
        payload.conversationId = selectedChat._id;
      } else if (isGroupChat(selectedChat)) {
        payload.conversationId = selectedChat._id;
      }
      
      const [err, message, conversation] = await sendDirectMessage(payload, socket);
      
      if (err) return toast.error(err.message || String(err));
      
      if (conversation && isFriendChat(selectedChat)) {
        const directConv = {
          _id: String(conversation._id),
          avatar: conversation?.avatar || "",
          lastMessage: {
            content: trimmedMessage,
            senderId: user._id,
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMuted: false,
          isPinned: false,
          unreadCount: 0,
          type: "direct" as const,
          participants: [
            {
              userId: user._id,
              isMuted: false,
              isPinned: false,
              unreadCount: 0,
              _id: String(conversation._id) + "_" + user._id
            },
            {
              userId: selectedChat._id,
              isMuted: false,
              isPinned: false,
              unreadCount: 0,
              _id: String(conversation._id) + "_" + selectedChat._id
            }
          ],
          receiverId: selectedChat._id,
          receiverUserName: selectedChat.userName,
        };
        
        useCommunicationStore.getState().addDirectConversations(directConv);
      }
      
      if (message) {
        useCommunicationStore.getState().setMessages(message);
        setNewMessage("");
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    handleSendMessage
  };
};