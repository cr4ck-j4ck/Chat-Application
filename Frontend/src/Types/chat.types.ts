// Base conversation participant interface
export interface IConversationParticipant {
  userId: string;
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  _id?: string;
}

// Base conversation interface
export interface IBaseConversation {
  _id: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp?: string;
  };
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  participants: IConversationParticipant[];
}

// Group chat interface
export interface IGroupChat extends IBaseConversation {
  type: "group";
  conversationName: string;
}

// Direct chat interface with receiver information
export interface IDirectChat extends IBaseConversation {
  type: "direct";
  receiverId: string;
  receiverUserName: string;
  receiverFirstName?: string;
  receiverLastName?: string;
  receiverAvatar?: string;
  isOnline?: boolean;
}

// Friend interface for users who aren't in conversations yet
export interface IFriend {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  avatar?: string;
  isOnline: boolean;
  isPinned: boolean;
  isMuted: boolean;
  unreadCount: number;
  type: "direct";
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp?: string;
  };
}

// Union type for all chat types
export type ChatUnion = IGroupChat | IDirectChat | IFriend;

// Type guards
export const isDirectChat = (chat: ChatUnion): chat is IDirectChat => {
  return 'type' in chat && chat.type === 'direct' && 'receiverId' in chat;
};

export const isGroupChat = (chat: ChatUnion): chat is IGroupChat => {
  return 'type' in chat && chat.type === 'group' && 'conversationName' in chat;
};

export const isFriendChat = (chat: ChatUnion): chat is IFriend => {
  return 'firstName' in chat && 'userName' in chat && !('receiverId' in chat);
};

// Helper functions for safe property access
export const getChatDisplayName = (chat: ChatUnion): string => {
  if (isGroupChat(chat)) return chat.conversationName;
  if (isDirectChat(chat)) return chat.receiverUserName;
  if (isFriendChat(chat)) return `${chat.firstName} ${chat.lastName}`.trim() || chat.userName;
  return 'Unknown';
};

export const getChatAvatar = (chat: ChatUnion): string | undefined => {
  if (isDirectChat(chat)) return chat.receiverAvatar || chat.avatar;
  if (isFriendChat(chat)) return chat.avatar;
  if (isGroupChat(chat)) return chat.avatar;
  return undefined;
};

export const getChatAvatarFallback = (chat: ChatUnion): string => {
  if (isDirectChat(chat)) return chat.receiverUserName?.[0] || 'U';
  if (isGroupChat(chat)) return chat.conversationName?.[0] || 'G';
  if (isFriendChat(chat)) return `${chat.firstName?.[0] || ''}${chat.lastName?.[0] || ''}` || chat.userName?.[0] || 'U';
  return 'U';
};