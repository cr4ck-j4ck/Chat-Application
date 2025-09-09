// src/utils/chatHelpers.ts
import type { IBaseConversation as IConversation, ChatUnion, IDirectChat, IGroupChat } from '@/Types/chat.types';

export const convertConversationToChat = (conversation: IConversation): IDirectChat | IGroupChat => {
  const convertedParticipants = conversation.participants.map(p => ({
    userId: typeof p.userId === 'string' ? p.userId : p.userId._id,
    isMuted: p.isMuted,
    isPinned: p.isPinned,
    unreadCount: p.unreadCount,
    _id: p._id
  }));
  
  if (conversation.type === "direct") {
    return {
      _id: conversation._id,
      type: "direct" as const,
      participants: convertedParticipants,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.lastMessage,
      avatar: conversation.avatar,
      receiverId: conversation.receiverId || '',
      receiverUserName: conversation.receiverUserName || '',
      receiverFirstName: conversation.receiverFirstName,
      receiverLastName: conversation.receiverLastName,
      receiverAvatar: conversation.receiverAvatar,
      isOnline: conversation.isOnline,
      isMuted: conversation.isMuted || false,
      isPinned: conversation.isPinned || false,
      unreadCount: conversation.unreadCount || 0
    };
  } else {
    return {
      _id: conversation._id,
      type: "group" as const,
      participants: convertedParticipants,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.lastMessage,
      avatar: conversation.avatar,
      conversationName: conversation.conversationName || '',
      isMuted: conversation.isMuted || false,
      isPinned: conversation.isPinned || false,
      unreadCount: conversation.unreadCount || 0
    };
  }
};