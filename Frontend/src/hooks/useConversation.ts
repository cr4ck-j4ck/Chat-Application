// src/hooks/useConversations.ts
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useCommunicationStore from '@/Store/communication.store';
import useUserStore from '@/Store/user.store';
import { fetchUserConversations } from '@/Services/user.api';
import { convertConversationToChat } from '@/Utility/ChatHelper';
import { useShallow } from 'zustand/react/shallow';
import type { ChatUnion, IDirectChat, IFriend } from '@/Types/chat.types';

export const useConversations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const user = useUserStore((state) => state.user);
  const { directConversations, setDirectConversations } = useCommunicationStore(useShallow((state) => ({
    directConversations: state.directConversations,
    setDirectConversations: state.setDirectConversations
  })));
  
  const idParameter = searchParams.get("id");

  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const conversations = await fetchUserConversations();
        
        const directConvos = conversations.filter(c => c.type === "direct");
        const convertedDirectConvos = directConvos
          .filter(c => c.type === "direct")
          .map(c => convertConversationToChat(c) as IDirectChat);
        
        setDirectConversations(convertedDirectConvos);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        toast.error("Failed to fetch conversations");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, [user, setDirectConversations]);

  return {
    isLoading,
    directConversations,
    idParameter
  };
};