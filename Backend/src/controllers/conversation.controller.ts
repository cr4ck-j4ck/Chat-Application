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
        .sort({ updatedAt: -1 })  // Sort by latest first
        .populate('participants.userId', 'firstName lastName userName avatar status')
        .lean();

        const formattedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherParticipant = conv.participants.find(p => p.userId.toString() !== userId);
            if (!otherParticipant) {
                return null;
            }
            
            // For direct chats, get the receiver's details
            if (conv.type === "direct") {
                const receiver = await User.findById(otherParticipant.userId)
                    .select('firstName lastName userName avatar status')
                    .lean();
                
                if (!receiver) {
                    return null;
                }

                // Find the current user's participant object
                const userParticipant = conv.participants.find(p => p.userId.toString() === userId);
                
                return {
                    _id: conv._id,
                    type: conv.type as "direct",
                    participants: conv.participants,
                    lastMessage: conv.lastMessage,
                    createdAt: conv.createdAt,
                    updatedAt: conv.updatedAt,
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
                    userId: p.userId.toString()
                }))
            };
        }));

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
