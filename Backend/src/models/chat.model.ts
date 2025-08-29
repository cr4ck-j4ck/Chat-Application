import { Schema, model, Document, Types } from "mongoose";

export interface IChat extends Document {
  type: "direct" | "group";
  participants: Types.ObjectId[]; // User references
  groupName:string;
  createdAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    groupName:{
        type:String,
        required:true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Chat = model<IChat>("Chat", chatSchema);
