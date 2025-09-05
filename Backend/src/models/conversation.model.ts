import { Schema, model, Document, Types } from "mongoose";


interface Iparticipants {
  userId: Types.ObjectId;
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
}

interface Iconversation extends Document {
  type: "direct" | "group";
  conversationName: string;
  participants: Iparticipants[]; // User references
  avatar: string;
  lastMessage: {
    content: string;
    senderId: Types.ObjectId;
  };
  createdAt: Date;
}

const lastMessageSchema = new Schema(
  {
    content: {
      type: String,
      required: true, // required inside lastMessage
      trim: true
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { _id: false } // don’t create separate _id for sub-doc
);


const chatSchema = new Schema<Iconversation>(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    participants: [
      {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        isMuted: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },
        unreadCount: {
          type : Number,
          default:0,
        },
      },
    ],
    conversationName: {
      type: String,
      required() {
        return this.type === "group";
      },
    },
    avatar: String,
    lastMessage: {
    type: lastMessageSchema,
    required: false, // lastMessage itself is optional
    validate: {
      validator: function (val) {
        if (!val) return true; // if not provided → valid
        return val.content && val.senderId; // if provided → must have both
      },
      message: "If lastMessage is provided, content and senderId are required."
    }
  }

  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Conversation = model<Iconversation>("Conversation", chatSchema);
