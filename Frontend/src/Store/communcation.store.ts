import { create } from "zustand";
import { type IdirectChat, type IgroupChat } from "@/components/Chat/ChatItem";

export interface IMessage {
  _id: string;
  conversationId: string; // Reference to the Chat/Conversation
  senderId: string; // Reference to User who sent it
  content: string; // The message text (or JSON for richer types)
  type: "text" | "image" | "file" | "system"; // For extensibility (e.g., future media support)
  timestamp: string; // Timestamp for sorting and display
}

interface IconvoStore {
  messages: IMessage[];
  setMessages: (toUpdate: IMessage | IMessage[]) => void;
  appendMessage: (message: IMessage) => void;
  groupConversations: IgroupChat[];
  directConversations: IdirectChat[];
  addGroupConversations: (toUpdate: IgroupChat) => void;
  addDirectConversations: (toUpdate: IdirectChat | IdirectChat[]) => void;
  setDirectConversations: (conversations: IdirectChat[]) => void;
  clearDirectConversations: () => void;
  pinConversation: (pinnedConvoId: string, type: "group" | "direct") => void;
  clearMessages: () => void;
}

const useCommunicationStore = create<IconvoStore>((set) => ({
  messages: [],
  setMessages(toUpdate) {
    set({ messages: Array.isArray(toUpdate) ? toUpdate : [toUpdate] });
  },
  appendMessage(message) {
    set(state => ({
      messages: [...state.messages, message]
    }));
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
        (newConvo) => !state.directConversations.some((existing) => existing._id === newConvo._id)
      );
      return { directConversations: [...state.directConversations, ...uniqueConvos] };
    });
  },
  setDirectConversations(conversations) {
    set({ directConversations: conversations });
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
            el._id === pinnedConvoId ? { ...el, isPinned:!el.isPinned } : el
          ),
        };
      }
    });
  },
}));

export default useCommunicationStore;
