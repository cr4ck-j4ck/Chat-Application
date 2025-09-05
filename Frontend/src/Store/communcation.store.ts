import { create } from "zustand";
import { type Chat } from "@/components/Chat/ChatItem";


export interface IMessage {
  _id: string;
  conversationId: string; // Reference to the Chat/Conversation
  senderId: string; // Reference to User who sent it
  content: string; // The message text (or JSON for richer types)
  type: "text" | "image" | "file" | "system"; // For extensibility (e.g., future media support)
  timestamp: Date; // Timestamp for sorting and display
}

interface IuserStore {
  messages: IMessage[] | null;
  setMessages: (toUpdate: IMessage) => void;
  conversations: Chat | null;
  setConversations: (toUpdate: Chat) => void;
}

const useCommunicationStore = create<IuserStore>((set) => ({
  messages: null,
  setMessages(toUpdate) {
    set((state) => {
      if (state.messages) {
        return { messages: [...state.messages, toUpdate] };
      } else {
        return state;
      }
    });
  },
  conversations: null,
  setConversations() {
    set((state) => state);
  },
}));

export default useCommunicationStore;
