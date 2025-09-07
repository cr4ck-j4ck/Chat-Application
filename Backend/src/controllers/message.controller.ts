import { Request, Response } from "express";
import { Message } from "../models/message.model";
import { Conversation } from "../models/conversation.model";

export async function addMessageToDatabase(req: Request, res: Response) {
    try {
        const { conversationId, senderId, content, type } = req.body;
        if (!conversationId || !senderId || !content) {
            return res.status(400).json({ error: "conversationId, senderId and content required" });
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            content,
            type: type || "text",
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            $set: { "lastMessage.content": content, "lastMessage.senderId": senderId },
        });

        return res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export default addMessageToDatabase;