import { Request, Response } from "express";
import { Conversation } from "../models/conversation.model";
import { model } from "mongoose";

const User = model('User');

export async function getUserConversations(req: Request, res: Response) {
    try {
        const userId = req.user.userId;
        const conversations = await Conversation.find({ 
            "participants.userId": userId 
        })
        .sort({ updatedAt: -1 })
        .populate('participants.userId', 'firstName lastName userName avatar status')
        .lean();

        const formattedConversations = conversations.map((conv) => {
            const otherParticipant = conv.participants.find(p => p.userId.toString() !== userId);
            if (!otherParticipant) return null;
            
            if (conv.type === "direct") {
                // The participant.userId is already populated with user data
                const receiver = otherParticipant.userId;
                const userParticipant = conv.participants.find(p => p.userId.toString() === userId);
                
                return {
                    conversationName: `${receiver.firstName} ${receiver.lastName}`.trim() || receiver.userName,
                    _id: conv._id.toString(),
                    type: conv.type as "direct",
                    participants: conv.participants.map(p => ({
                        ...p,
                        userId: p.userId._id ? p.userId._id.toString() : p.userId.toString()
                    })),
                    lastMessage: conv.lastMessage,
                    createdAt: conv.createdAt,
                    updatedAt: conv.updatedAt,
                    receiverFirstName: receiver.firstName,
                    receiverLastName: receiver.lastName,
                    receiverUserName: receiver.userName,
                    receiverId: receiver._id.toString(),
                    avatar: receiver.avatar,
                    isOnline: receiver.status === 'online',
                    isMuted: userParticipant?.isMuted || false,
                    isPinned: userParticipant?.isPinned || false,
                    unreadCount: userParticipant?.unreadCount || 0,
                };
            }
            
            return {
                ...conv,
                _id: conv._id.toString(),
                participants: conv.participants.map(p => ({
                    ...p,
                    userId: p.userId._id ? p.userId._id.toString() : p.userId.toString()
                }))
            };
        });

        // Filter out any null values and sort by isPinned and then by updatedAt
        const validConversations = formattedConversations
            .filter((conv): conv is NonNullable<typeof conv> => conv !== null)
            .sort((a, b) => {
                // First sort by pin status
                if ((a as any).isPinned && !(b as any).isPinned) return -1;
                if (!(a as any).isPinned && (b as any).isPinned) return 1;

                // Then sort by updatedAt
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });

        res.json(validConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: "Error fetching conversations" });
    }
}
