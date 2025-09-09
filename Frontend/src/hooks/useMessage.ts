// src/hooks/useMessages.ts
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useCommunicationStore from '@/Store/communication.store';
import { fetchConversationMessages } from '@/Services/user.api';
import type { ChatUnion, IDirectChat, IGroupChat, IFriend } from '@/Types/chat.types';
import { isDirectChat, isFriendChat, isGroupChat } from '@/Types/chat.types';
import { useShallow } from 'zustand/react/shallow';
export const useMessages = (selectedChat: ChatUnion | null, directConversations: any[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const { messages, setMessages } = useCommunicationStore(useShallow((state) => ({
    messages: state.messages,
    setMessages: state.setMessages
  })));

  useEffect(() => {
    if (!selectedChat) return;
    
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        let conversationId: string;
        
        if (isDirectChat(selectedChat)) {
          conversationId = selectedChat._id;
        } else if (isFriendChat(selectedChat)) {
          const existingConvo = directConversations.find(
            c => isDirectChat(c) && c.receiverId === selectedChat._id
          );
          
          if (!existingConvo) {
            setMessages([]);
            return;
          }
          conversationId = existingConvo._id;
        } else {
          conversationId = selectedChat._id;
        }
        
        const fetchedMessages = await fetchConversationMessages(conversationId);
        // Filter out messages from other conversations and set only relevant messages
        const relevantMessages = messages.filter(msg => msg.conversationId !== conversationId);
        setMessages([...relevantMessages, ...fetchedMessages]);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [selectedChat, directConversations, setMessages]);

  return {
    isLoading,
    messages
  };
};