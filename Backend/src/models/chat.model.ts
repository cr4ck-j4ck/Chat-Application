import mongoose, { Schema, model, Document, Types, mongo } from "mongoose";

export interface IChat extends Document {
  type: "direct" | "group";
  participants: Types.ObjectId[]; // User references
  lastMessage: {
    content: string,
    senderId: string,
    timestamp: Date
  },
  createdAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: {
      content: {
        type:String,
        required:true
      },
      senderId: {
        type:String,
        required:true
      },
      timestamp: Date
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Chat = model<IChat>("Chat", chatSchema);
