import { type IMessage } from "@/Store/communcation.store";
import type { Socket } from "socket.io-client";
import type { IdirectChat } from "@/components/Chat/ChatItem";

export interface SendMessagePayload {
    content: string;
    senderId: string;
    receiverId?: string;
    conversationId?: string;
}

interface SendMessageResponse {
    ok: boolean;
    error?: string;
    message?: IMessage;
    conversation?: Partial<IdirectChat> | null;
}

export const sendDirectMessage = async (
    data: SendMessagePayload,
    socket: Socket | null
): Promise<[Error | null, IMessage | null, Partial<IdirectChat> | null]> => {
    if (!socket) return [new Error("No socket"), null, null];

    return new Promise((resolve) => {
        socket.emit("send_message", data, (response: SendMessageResponse) => {
            if (!response || !response.ok) {
                return resolve([new Error(response?.error || "Unknown error"), null, null]);
            }
            return resolve([null, response.message || null, response.conversation || null]);
        });
    });
};

export const startDirectConvo = sendDirectMessage;