import type React from "react";
import { toast, Toaster } from "sonner";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sendDirectMessage } from "@/Services/sendMessage.socket";
import useCommunicationStore from "@/Store/communcation.store";
import useGlobalStore from "@/Store/global.store";
import useUserStore from "@/Store/user.store";
import { Textarea } from "@/components/ui/textarea";
import { sendFriendRequest } from "@/Services/user.api";
import { Search, Send, Smile, Paperclip, Pin, UserPlus } from "lucide-react";
import {
  type ChatUnion,
  type IDirectChat,
  type IGroupChat,
  type IFriend,
  isDirectChat,
  isGroupChat,
  isFriendChat,
  getChatDisplayName,
  getChatAvatar,
  getChatAvatarFallback
} from "@/Types/chat.types";
import { useShallow } from "zustand/react/shallow";
import { type IMessage } from "@/Store/communcation.store";
import { fetchUserConversations, fetchConversationMessages } from "@/Services/user.api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { type IConversation } from "@/Types/conversation.types";

// Helper function to convert IConversation to ChatUnion
const convertConversationToChat = (conversation: IConversation): IDirectChat | IGroupChat => {
  // Convert participants to proper format
  const convertedParticipants = conversation.participants.map(p => ({
    userId: typeof p.userId === 'string' ? p.userId : p.userId._id,
    isMuted: p.isMuted,
    isPinned: p.isPinned,
    unreadCount: p.unreadCount,
    _id: p._id
  }));

  if (conversation.type === "direct") {
    return {
      _id: conversation._id,
      type: "direct" as const,
      participants: convertedParticipants,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.lastMessage,
      avatar: conversation.avatar,
      receiverId: conversation.receiverId || '',
      receiverUserName: conversation.receiverUserName || '',
      receiverFirstName: conversation.receiverFirstName,
      receiverLastName: conversation.receiverLastName,
      receiverAvatar: conversation.receiverAvatar,
      isOnline: conversation.isOnline,
      isMuted: conversation.isMuted || false,
      isPinned: conversation.isPinned || false,
      unreadCount: conversation.unreadCount || 0
    };
  } else {
    return {
      _id: conversation._id,
      type: "group" as const,
      participants: convertedParticipants,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.lastMessage,
      avatar: conversation.avatar,
      conversationName: conversation.conversationName || '',
      isMuted: conversation.isMuted || false,
      isPinned: conversation.isPinned || false,
      unreadCount: conversation.unreadCount || 0
    };
  }
};


const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<ChatUnion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chatId: string;
    chatType: "group" | "direct";
  } | null>(null);
  const [addFriendUsername, setAddFriendUsername] = useState("");
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const {
    messages,
    directConversations,
    pinConversations,
    setDirectConversations,
    setMessages,
    appendMessage
  } = useCommunicationStore(
    useShallow((state) => ({
      messages: state.messages,
      directConversations: state.directConversations,
      pinConversations: state.pinConversation,
      setDirectConversations: state.setDirectConversations,
      setMessages: state.setMessages,
      appendMessage: state.appendMessage
    }))
  );
  const user = useUserStore((state) => state.user);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams()[0];
  const socket = useGlobalStore((state) => state.socket);
  const idParameter = searchParams.get("id");
  let filteredFriends: IFriend[] = [];
  
  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch conversations when component mounts
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const conversations = await fetchUserConversations();
        
        console.log("Fetched conversations:", conversations);
        
        // The backend already returns properly formatted conversations
        const directConvos = conversations.filter(c => c.type === "direct");
        
        console.log("Direct conversations:", directConvos);
        
        const convertedDirectConvos = directConvos
          .filter(c => c.type === "direct")
          .map(c => convertConversationToChat(c) as IDirectChat);
        
        setDirectConversations(convertedDirectConvos);
        
        // If there's an ID parameter, select that conversation
        if (idParameter) {
          const selectedConvo = directConvos.find(c =>
            c._id === idParameter ||
            (c.type === "direct" && c.receiverId === idParameter)
          );
          if (selectedConvo) {
            setSelectedChat(convertConversationToChat(selectedConvo));
          } else {
            // Check if it's a friend we haven't chatted with yet
            const friend = user.friends.find(f => f._id === idParameter);
            if (friend) {
              const friendChat: IFriend = {
                _id: friend._id,
                firstName: friend.firstName,
                lastName: friend.lastName,
                userName: friend.userName,
                avatar: friend.avatar,
                isOnline: false,
                isPinned: false,
                isMuted: false,
                unreadCount: 0,
                type: "direct" as const
              };
              setSelectedChat(friendChat);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        toast.error("Failed to fetch conversations");
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, idParameter, setDirectConversations]);

  // Handle real-time updates and notifications
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data: IMessage) => {
      // Check if this message is for the currently selected chat
      const isCurrentChat = selectedChat && (
        (isDirectChat(selectedChat) && selectedChat._id === data.conversationId) ||
        (isFriendChat(selectedChat) && directConversations.some(c =>
          isDirectChat(c) && c.receiverId === selectedChat._id && c._id === data.conversationId
        ))
      );

      if (isCurrentChat) {
        // Add message to current chat
        appendMessage(data);
      } else {
        // Show notification for new message from other chats
        const senderConversation = directConversations.find(c =>
          c._id === data.conversationId
        );
        
        if (senderConversation && data.senderId !== user._id) {
          const senderName = isDirectChat(senderConversation)
            ? senderConversation.receiverUserName ||
              `${senderConversation.receiverFirstName || ''} ${senderConversation.receiverLastName || ''}`.trim()
            : 'Someone';
          
          toast(`New message from ${senderName}`, {
            description: data.content,
            action: {
              label: "View",
              onClick: () => setSelectedChat(senderConversation)
            }
          });
        }

        // Update conversation list to show latest message using functional update
        setDirectConversations(prevConversations => {
          const updatedConvos = prevConversations.map(conv => {
            if (conv._id === data.conversationId) {
              return {
                ...conv,
                lastMessage: {
                  content: data.content,
                  senderId: data.senderId,
                  timestamp: new Date().toISOString()
                },
                unreadCount: conv.unreadCount + (data.senderId !== user._id ? 1 : 0)
              };
            }
            return conv;
          });

          // Sort conversations by latest message
          return [...updatedConvos].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            const aTime = a.lastMessage?.timestamp || new Date().toISOString();
            const bTime = b.lastMessage?.timestamp || new Date().toISOString();
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
        });
      }
    };

    socket.on("receive_message", handleNewMessage);
    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, user, selectedChat, appendMessage]);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    // Clear unread count when chat is selected
    if (isDirectChat(selectedChat)) {
      setDirectConversations(prevConversations =>
        prevConversations.map(conv => {
          if (conv._id === selectedChat._id) {
            return {
              ...conv,
              unreadCount: 0
            };
          }
          return conv;
        })
      );
    }

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        let conversationId: string;
        
        if (isDirectChat(selectedChat)) {
          conversationId = selectedChat._id;
        } else if (isFriendChat(selectedChat)) {
          // Check if we have a conversation with this friend
          const existingConvo = directConversations.find(
            c => isDirectChat(c) && c.receiverId === selectedChat._id
          );
          if (!existingConvo) {
            // No conversation yet, clear messages
            setMessages([]);
            return;
          }
          conversationId = existingConvo._id;
        } else {
          // Group chat
          conversationId = selectedChat._id;
        }

        const messages = await fetchConversationMessages(conversationId);
        setMessages(messages);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages");
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChat]);

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
  useEffect(() => {
    randomConvoStartingMsgRef.current =
      conversationStartingMsgs[
        Math.floor(Math.random() * conversationStartingMsgs.length)
      ];
  }, [conversationStartingMsgs]);

  if (!user) {
    return null;
  }

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !selectedChat || !socket || !user) {
      if (!socket) toast.error("Connection lost. Please refresh the page.");
      if (!user) toast.error("Please log in to send messages.");
      if (!selectedChat) toast.error("Please select a chat first.");
      return;
    }

    try {
      setIsSendingMessage(true);
      type SendPayload = { content: string; senderId: string; receiverId?: string; conversationId?: string; type?: "text" | "image" | "file" | "system" };
      const payload: SendPayload = { content: trimmedMessage, senderId: user._id, type: "text" };

      if (isFriendChat(selectedChat)) {
        // For friend chats, check if there's an existing conversation
        const existingConvo = directConversations.find(
          c => isDirectChat(c) && c.receiverId === selectedChat._id
        );
        if (existingConvo) {
          payload.conversationId = existingConvo._id;
        } else {
          payload.receiverId = selectedChat._id;
        }
      } else if (isDirectChat(selectedChat)) {
        payload.conversationId = selectedChat._id;
      } else if (isGroupChat(selectedChat)) {
        payload.conversationId = selectedChat._id;
      }

      console.log("Sending message with payload:", payload);
      console.log("Selected chat:", selectedChat);

      const [err, message, conversation] = await sendDirectMessage(payload, socket);
      console.log("Send message result:", { err, message, conversation });
      
      if (err) return toast.error(err.message || String(err));

      // If server returned a conversation (new convo created), add to store and select it
      if (conversation && isFriendChat(selectedChat)) {
        const directConv: IDirectChat = {
          _id: String(conversation._id),
          avatar: conversation?.avatar || "",
          lastMessage: {
            content: trimmedMessage,
            senderId: user._id,
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isMuted: false,
          isPinned: false,
          unreadCount: 0,
          type: "direct" as const,
          participants: [
            {
              userId: user._id,
              isMuted: false,
              isPinned: false,
              unreadCount: 0,
              _id: String(conversation._id) + "_" + user._id
            },
            {
              userId: selectedChat._id,
              isMuted: false,
              isPinned: false,
              unreadCount: 0,
              _id: String(conversation._id) + "_" + selectedChat._id
            }
          ],
          receiverId: selectedChat._id,
          receiverUserName: selectedChat.userName,
        };

        // Add conversation to store
        useCommunicationStore.getState().addDirectConversations(directConv);
        setSelectedChat(directConv);
      }

      if (message) {
        useCommunicationStore.getState().setMessages(message);
        setNewMessage("");
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Filter conversations based on search query
  if (searchQuery) {
    filteredFriends = user.friends.filter((friend) =>
      // hide friend if direct conversation already exists with them
      !directConversations.some((dc) => dc.receiverId === friend._id) &&
      (friend.firstName || "")
        .concat(" ", friend.lastName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }

  const handleRightClick = (
    e: React.MouseEvent,
    chatId: string,
    chatType: "group" | "direct"
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      chatId,
      chatType,
    });
  };

  const handlePin = () => {
    if (!contextMenu) return;
    pinConversations(contextMenu.chatId, contextMenu.chatType);
    setContextMenu(null);
  };


  // Remove duplicate socket listener - already handled above

  const handleAddFriend = async () => {
    try {
      if (!user) {
        toast.error("Please log in to send friend requests");
        return;
      }
      
      const friendData = {
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        _id: user._id
      };
      
      await sendFriendRequest(friendData, addFriendUsername);
      toast.success("Friend request sent!");
      setIsAddFriendOpen(false);
      setAddFriendUsername("");
    } catch {
      toast.error("Failed to send friend request");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r bg-background overflow-y-auto">
        {/* Search Input and Profile Button */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="shrink-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          {/* Friend Suggestions */}
          {searchQuery && filteredFriends.length > 0 && (
            <div className="p-2">
              <h3 className="text-sm font-medium mb-2">Suggested Friends</h3>
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b relative"
                  onClick={() => setSelectedChat(friend)}
                >
                  <Avatar>
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>
                      {friend.firstName?.[0]}
                      {friend.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {friend.firstName} {friend.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {friend.userName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Direct Conversations */}
          <div>
            <h3 className="text-sm font-medium p-2">Chats</h3>
            {isLoadingConversations ? (
              <div className="p-4">
                <LoadingSpinner size="sm" text="Loading conversations..." />
              </div>
            ) : (
              directConversations
              .filter(chat => 
                !searchQuery || 
                chat.receiverUserName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
              .map((chat) => (
                <div
                  key={chat._id}
                  className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b relative ${
                    selectedChat?._id === chat._id ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedChat(chat)}
                  onContextMenu={(e) => handleRightClick(e, chat._id, "direct")}
                >
                  <Avatar>
                    <AvatarImage src={getChatAvatar(chat)} />
                    <AvatarFallback>
                      {getChatAvatarFallback(chat)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium truncate">
                        {getChatDisplayName(chat)}
                      </p>
                      {chat.isPinned && (
                        <Pin className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {chat.unreadCount}
                      </div>
                    </div>
                  )}
                </div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getChatAvatar(selectedChat)} />
                  <AvatarFallback>
                    {getChatAvatarFallback(selectedChat)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">
                    {getChatDisplayName(selectedChat)}
                  </h2>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner size="md" text="Loading messages..." />
                </div>
              ) : (
                messages
                .filter(msg => {
                  if (isDirectChat(selectedChat)) {
                    return msg.conversationId === selectedChat._id;
                  } else if (isFriendChat(selectedChat)) {
                    // For friend chats, check if there's an existing conversation
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
                      message.senderId === user._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] break-words rounded-lg p-3 ${
                        message.senderId === user._id
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )))}
              
              {/* Show conversation starting message for new chats */}
              {isFriendChat(selectedChat) && messages.length === 0 && (
                <div className="text-center text-muted-foreground italic">
                  {randomConvoStartingMsgRef.current}
                </div>
              )}
              )
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Chat</h2>
              <p className="text-muted-foreground mb-4">
                Select a chat to start messaging
              </p>
              <Button onClick={() => setIsAddFriendOpen(true)}>
                Start a new chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          className="bg-popover text-popover-foreground shadow-md rounded-md py-1 min-w-[160px] z-50"
        >
          <button
            onClick={handlePin}
            className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            <Pin className="h-4 w-4" />
            Pin chat
          </button>
        </div>
      )}

      {/* Add Friend Dialog */}
      <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <UserPlus className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Enter username"
              value={addFriendUsername}
              onChange={(e) => setAddFriendUsername(e.target.value)}
            />
            <Button onClick={handleAddFriend}>
              Send Friend Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default ChatPage;
