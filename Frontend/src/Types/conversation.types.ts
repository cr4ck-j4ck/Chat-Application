export interface IPopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
}

export interface IConversationParticipant {
  userId: IPopulatedUser | string; // String when not populated
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  _id: string;
}

export interface IConversation {
  _id: string;
  type: "direct" | "group";
  participants: IConversationParticipant[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp?: string;
  };
  // For group chats
  conversationName?: string;
  avatar?: string;
}
