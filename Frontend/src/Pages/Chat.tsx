import type React from "react";
import { toast, Toaster } from "sonner";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sendDirectMessage } from "@/Services/sendMessage.socket";
import useCommunicationStore from "@/Store/communcation.store";
import useGlobalStore from "@/Store/global.store";
import useUserStore, { type Ifriends } from "@/Store/user.store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { sendFriendRequest } from "@/Services/user.api";
import { Search, Send, Smile, Paperclip, Pin } from "lucide-react";
import { type IgroupChat, type IdirectChat } from "@/components/Chat/ChatItem";
import { useShallow } from "zustand/react/shallow";
import { type IMessage } from "@/Store/communcation.store";
import { fetchUserConversations, fetchConversationMessages } from "@/Services/user.api";

type ChatUnion = IgroupChat | IdirectChat | Ifriends;

const isFriendChat = (chat: ChatUnion): chat is Ifriends => {
  return 'firstName' in chat;
};

const isGroupChat = (chat: ChatUnion): chat is IgroupChat => {
  return 'type' in chat && chat.type === 'group' && 'conversationName' in chat;
};

const isDirectChat = (chat: ChatUnion): chat is IdirectChat => {
  return 'type' in chat && chat.type === 'direct' && 'receiverId' in chat;
};

const getDisplayInitials = (chat: ChatUnion): string => {
  if (isFriendChat(chat)) {
    if (chat.firstName && chat.lastName) {
      return `${chat.firstName[0]}${chat.lastName[0]}`;
    } else if (chat.firstName) {
      return chat.firstName.substring(0, 2).toUpperCase();
    } else if (chat.userName) {
      return chat.userName.substring(0, 2).toUpperCase();
    }
    return '??';
  } else if (isGroupChat(chat)) {
    return chat.conversationName ? 
      chat.conversationName.substring(0, 2).toUpperCase() : 
      'GC';
  } else {
    return chat.receiverUserName ? 
      chat.receiverUserName.substring(0, 2).toUpperCase() :
      '??';
  }
};

const getDisplayName = (chat: ChatUnion): string => {
  if (isFriendChat(chat)) {
    return chat.firstName ? 
      chat.firstName + (chat.lastName ? ' ' + chat.lastName : '') :
      chat.userName;
  } else if (isGroupChat(chat)) {
    return chat.conversationName;
  } else {
    return chat.receiverUserName;
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
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  
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
  let filteredFriends: Ifriends[] = [];
  
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
        const conversations = await fetchUserConversations();
        const directConvos = conversations
          .filter(c => c.type === "direct")
          .map(c => {
            const otherParticipantData = c.participants.find(p => {
              const userId = typeof p.userId === 'string' ? p.userId : p.userId._id;
              return userId !== user._id;
            });
            const userParticipantData = c.participants.find(p => {
              const userId = typeof p.userId === 'string' ? p.userId : p.userId._id;
              return userId === user._id;
            });
            
            if (!otherParticipantData || !userParticipantData) return null;

            // Convert participant to expected type
            const otherParticipant = {
              userId: typeof otherParticipantData.userId === 'string' ? 
                otherParticipantData.userId : 
                otherParticipantData.userId._id,
              isMuted: otherParticipantData.isMuted,
              isPinned: otherParticipantData.isPinned,
              unreadCount: otherParticipantData.unreadCount
            };

            const userParticipant = {
              userId: typeof userParticipantData.userId === 'string' ? 
                userParticipantData.userId : 
                userParticipantData.userId._id,
              isMuted: userParticipantData.isMuted,
              isPinned: userParticipantData.isPinned,
              unreadCount: userParticipantData.unreadCount
            };

            const otherUserData = typeof otherParticipantData.userId === 'string' ? null : otherParticipantData.userId;

            return {
              _id: c._id,
              type: "direct" as const,
              participants: [otherParticipant, userParticipant],
              lastMessage: c.lastMessage ? {
                content: c.lastMessage.content,
                senderId: c.lastMessage.senderId,
                timestamp: c.updatedAt
              } : undefined,
              createdAt: c.createdAt,
              updatedAt: c.updatedAt,
              receiverUserName: otherUserData?.userName || "",
              receiverId: typeof otherParticipantData.userId === 'string' ? 
                otherParticipantData.userId : 
                otherParticipantData.userId._id,
              avatar: otherUserData?.avatar,
              isOnline: false, // Will be updated through socket
              isMuted: userParticipant.isMuted,
              isPinned: userParticipant.isPinned,
              unreadCount: userParticipant.unreadCount
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);

        setDirectConversations(directConvos);
        
        // If there's an ID parameter, select that conversation
        if (idParameter) {
          const selectedConvo = directConvos.find(c => c._id === idParameter || c.receiverId === idParameter);
          if (selectedConvo) {
            setSelectedChat(selectedConvo);
          } else {
            // Check if it's a friend we haven't chatted with yet
            const friend = user.friends.find(f => f._id === idParameter);
            if (friend) {
              setSelectedChat(friend);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        toast.error("Failed to fetch conversations");
      }
    };

    fetchConversations();
  }, [user, idParameter, setDirectConversations]);

  // Handle real-time updates and notifications
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data: IMessage) => {
      // Update messages if the chat is currently selected
      if (selectedChat && 
        ((isDirectChat(selectedChat) && selectedChat._id === data.conversationId) ||
         (isFriendChat(selectedChat) && selectedChat._id === data.senderId))
      ) {
        appendMessage(data);
      } else {
        // Show notification if not in the current chat
        const sender = directConversations.find(c => 
          c._id === data.conversationId || c.receiverId === data.senderId
        );
        if (sender) {
          toast(`New message from ${sender.receiverUserName}`, {
            description: data.content,
            action: {
              label: "View",
              onClick: () => setSelectedChat(sender)
            }
          });
        }

        // Update conversation list to show latest message
        const updatedConvos = directConversations.map(conv => {
          if (conv._id === data.conversationId || conv.receiverId === data.senderId) {
            return {
              ...conv,
              lastMessage: {
                content: data.content,
                senderId: data.senderId,
                timestamp: new Date().toISOString()
              },
              unreadCount: conv.unreadCount + 1
            };
          }
          return conv;
        });

        // Sort conversations by latest message
        const sortedConvos = [...updatedConvos].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const aTime = a.lastMessage?.timestamp || new Date().toISOString();
          const bTime = b.lastMessage?.timestamp || new Date().toISOString();
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

        setDirectConversations(sortedConvos);
      }
    };

    socket.on("receive_message", handleNewMessage);
    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, user, selectedChat, directConversations, appendMessage, setDirectConversations, setSelectedChat]);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      try {
        let conversationId: string;
        if (isDirectChat(selectedChat)) {
          conversationId = selectedChat._id;
        } else if (isFriendChat(selectedChat)) {
          // Check if we have a conversation with this friend
          const existingConvo = directConversations.find(
            c => c.receiverId === selectedChat._id
          );
          if (!existingConvo) return; // No messages yet
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
      }
    };

    loadMessages();
  }, [selectedChat, directConversations, setMessages]);

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
      type SendPayload = { content: string; senderId: string; receiverId?: string; conversationId?: string; type?: "text" | "image" | "file" | "system" };
      const payload: SendPayload = { content: trimmedMessage, senderId: user._id, type: "text" };

      if (isFriendChat(selectedChat)) {
        payload.receiverId = selectedChat._id;
      } else if (isDirectChat(selectedChat) || isGroupChat(selectedChat)) {
        payload.conversationId = selectedChat._id;
      }

      const [err, message, conversation] = await sendDirectMessage(payload, socket);
      if (err) return toast.error(err.message || String(err));

      // If server returned a conversation (new convo created), add to store and select it
      if (conversation) {
        const receiverId = isFriendChat(selectedChat) ? 
          selectedChat._id : 
          (isDirectChat(selectedChat) ? selectedChat.receiverId : selectedChat._id);
        
        const receiverName = isFriendChat(selectedChat) ? 
          selectedChat.userName : 
          (isDirectChat(selectedChat) ? selectedChat.receiverUserName : "");

        const directConv: IdirectChat = {
          _id: String(conversation._id),
          avatar: conversation.avatar || "",
          lastMessage: {
            content: newMessage,
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
              userId: receiverId,
              isMuted: false,
              isPinned: false,
              unreadCount: 0,
              _id: String(conversation._id) + "_" + receiverId
            }
          ],
          receiverId,
          receiverUserName: receiverName,
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
            {directConversations
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
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>
                      {chat.receiverUserName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium truncate">
                        {chat.receiverUserName}
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
            ))}
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
                  <AvatarImage src={selectedChat.avatar} />
                  <AvatarFallback>
                    {getDisplayInitials(selectedChat)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{getDisplayName(selectedChat)}</h2>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => 
                  isDirectChat(selectedChat) ? 
                    msg.conversationId === selectedChat._id :
                    isFriendChat(selectedChat) && false // No messages for new chats
                )
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
                ))}
              
              {/* Show conversation starting message for new chats */}
              {isFriendChat(selectedChat) && messages.length === 0 && (
                <div className="text-center text-muted-foreground italic">
                  {randomConvoStartingMsgRef.current}
                </div>
              )}
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
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new friend</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!user) {
                  throw new Error("Please login first");
                }
                await sendFriendRequest({
                  _id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  userName: user.userName
                }, friendUsername);
                toast.success("Friend request sent!");
                setIsAddFriendOpen(false);
                setFriendUsername("");
              } catch {
                toast.error("Failed to add friend");
              }
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Enter username..."
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
            />
            <Button type="submit" disabled={!friendUsername.trim()}>
              Send Friend Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default ChatPage;
