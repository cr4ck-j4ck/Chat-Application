import { create } from "zustand";
import { type IDirectChat, type IGroupChat } from "@/Types/chat.types";

export interface IMessage {
  _id: string;
  conversationId: string; // Reference to the Chat/Conversation
  senderId: string; // Reference to User who sent it
  content: string; // The message text (or JSON for richer types)
  type: "text" | "image" | "file" | "system"; // For extensibility (e.g., future media support)
  createdAt: string; // Timestamp for sorting and display
}

interface IconvoStore {
  messages: IMessage[];
  setMessages: (toUpdate: IMessage | IMessage[]) => void;
  appendMessage: (message: IMessage) => void;
  groupConversations: IGroupChat[];
  directConversations: IDirectChat[];
  addGroupConversations: (toUpdate: IGroupChat) => void;
  addDirectConversations: (toUpdate: IDirectChat | IDirectChat[]) => void;
  setDirectConversations: (conversations: IDirectChat[] | ((prev: IDirectChat[]) => IDirectChat[])) => void;
  clearDirectConversations: () => void;
  pinConversation: (pinnedConvoId: string, type: "group" | "direct") => void;
  clearMessages: () => void;
}

const useCommunicationStore = create<IconvoStore>((set) => ({
  messages: [],
  setMessages(toUpdate) {
    set((state) => {
      if (Array.isArray(toUpdate)) {
        // When setting multiple messages, replace all messages
        return { messages: toUpdate };
      } else {
        // When setting a single message, check if it exists and update or add
        const existingIndex = state.messages.findIndex(msg => msg._id === toUpdate._id);
        if (existingIndex !== -1) {
          // Update existing message
          const updatedMessages = [...state.messages];
          updatedMessages[existingIndex] = toUpdate;
          return { messages: updatedMessages };
        } else {
          // Add new message
          return { messages: [...state.messages, toUpdate] };
        }
      }
    });
  },
  appendMessage(message) {
    set((state) => {
      // Check if message already exists to prevent duplicates
      const messageExists = state.messages.some(
        (msg) => msg._id === message._id
      );
      if (messageExists) {
        return state;
      }
      return {
        messages: [...state.messages, message],
      };
    });
  },
  clearMessages() {
    set({ messages: [] });
  },
  groupConversations: [],
  directConversations: [],
  addGroupConversations(toUpdate) {
    set((state) => ({
      groupConversations: [...state.groupConversations, toUpdate],
    }));
  },
  addDirectConversations(toUpdate) {
    set((state) => {
      const convos = Array.isArray(toUpdate) ? toUpdate : [toUpdate];
      const uniqueConvos = convos.filter(
        (newConvo) =>
          !state.directConversations.some(
            (existing) => existing._id === newConvo._id
          )
      );
      return {
        directConversations: [...state.directConversations, ...uniqueConvos],
      };
    });
  },
  setDirectConversations(conversations) {
    if (typeof conversations === 'function') {
      set((state) => ({ directConversations: conversations(state.directConversations) }));
    } else {
      set({ directConversations: conversations });
    }
  },
  clearDirectConversations() {
    set({ directConversations: [] });
  },
  pinConversation: (pinnedConvoId, type) => {
    set((prevState) => {
      if (type === "direct") {
        return {
          directConversations: prevState.directConversations.map((el) =>
            el._id === pinnedConvoId ? { ...el, isPinned: !el.isPinned } : el
          ),
        };
      } else {
        return {
          groupConversations: prevState.groupConversations.map((el) =>
            el._id === pinnedConvoId ? { ...el, isPinned: !el.isPinned } : el
          ),
        };
      }
    });
  },
}));

export default useCommunicationStore;
