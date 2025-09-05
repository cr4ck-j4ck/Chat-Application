import { Schema, model, Document, Types } from "mongoose";

interface IMessage extends Document {
  conversationId: Types.ObjectId; // Reference to the Chat/Conversation
  senderId: Types.ObjectId; // Reference to User who sent it
  content: string; // The message text (or JSON for richer types)
  type: "text" | "image" | "file" | "system"; // For extensibility (e.g., future media support)
  readBy: Types.ObjectId[]; // Array of users who have read this message
  createdAt: Date; // Timestamp for sorting and display
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Chat", // Matches your Chat model name
      required: true,
      index: true, // For fast queries by conversation
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt; no need for updatedAt on immutable messages
  }
);

// Compound index for efficient message retrieval in a conversation (sorted by time descending)
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Prevent large documents; enforce max content length if needed (MongoDB doc limit is 16MB, but keep practical)
messageSchema.path("content").validate((val: string) => val.length <= 5000, "Message content too long.");

export const Message = model<IMessage>("Message", messageSchema);