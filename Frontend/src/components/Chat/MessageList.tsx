// src/components/chat/MessageList.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import useUserStore from '@/Store/user.store';
import { useMessages } from '@/hooks/useMessage';
import useCommunicationStore from '@/Store/communication.store';
import { isDirectChat, isFriendChat } from '@/Types/chat.types';
import type { ChatUnion } from '@/Types/chat.types';

const MessageList: React.FC<{ selectedChat: ChatUnion }> = ({ selectedChat }) => {
  const user = useUserStore((state) => state.user);
  const directConversations = useCommunicationStore(state => state.directConversations);
  
  const { isLoading, messages } = useMessages(selectedChat, directConversations);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const conversationStartingMsgs = useMemo(() => [
    "And here it begins… a brand-new vibe, a brand-new chat. Make your move 😏",
    "Your story with this person is still unwritten… ready to write the first line? 😉",
    "This could be the start of something fun… type your first message 👇",
    "Two strangers. One chat box. Infinite possibilities 😍",
    "Every great story starts with a hello… ready to send yours?",
    "Your next favorite conversation is about to begin. Don't keep them waiting 😉",
  ], []);
  
  const randomConvoStartingMsgRef = useRef<string>(
    "And here it begins… a brand-new vibe, a brand-new chat. Make your move 😏"
  );
  
  React.useEffect(() => {
    randomConvoStartingMsgRef.current =
      conversationStartingMsgs[
        Math.floor(Math.random() * conversationStartingMsgs.length)
      ];
  }, [conversationStartingMsgs]);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="md" text="Loading messages..." />
        </div>
      ) : (
        <>
          {messages
            .filter(msg => {
              if (isDirectChat(selectedChat)) {
                return msg.conversationId === selectedChat._id;
              } else if (isFriendChat(selectedChat)) {
                const existingConvo = directConversations.find(
                  c => isDirectChat(c) && c.receiverId === selectedChat._id
                );
                return existingConvo ? msg.conversationId === existingConvo._id : false;
              }
              return false;
            })
            .map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.senderId === user?._id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] break-words rounded-lg p-3 ${
                    message.senderId === user?._id
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          <div ref={messageEndRef}></div>
        </>
      )}
      {isFriendChat(selectedChat) && messages.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground italic">
          {randomConvoStartingMsgRef.current}
        </div>
      )}
    </div>
  );
};

export default MessageList;