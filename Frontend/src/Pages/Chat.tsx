import type React from "react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SplitText from "@/components/Chat/SplitText";
import { Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import useCommunicationStore, { type IMessage } from "@/Store/communcation.store";
import { useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useGlobalStore from "@/Store/global.store";
import useUserStore, { type Ifriends } from "@/Store/user.store";
import { Textarea } from "@/components/ui/textarea";
import { sendFriendRequest } from "@/Services/user.api";

import {
  Search,
  Send,
  Smile,
  Paperclip,
  Pin,
  VolumeX,
  Trash2,
  UserPlus,
  Filter,
  UserRoundPen,
  Phone,
  Video,
  Info,
  Archive,
  MessageCircle,
  Users,
} from "lucide-react";
import ChatItem, { type Chat } from "@/components/Chat/ChatItem";
import { useShallow } from "zustand/react/shallow";


interface CommanInSelectedChat {
  userName?: string;
  firstName?: string;
  lastName?: string;
  conversationName?: string;
}
type TselectedChat = (Chat | Ifriends) & CommanInSelectedChat;

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<TselectedChat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chatId: string;
  } | null>(null);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const {message , setMessage} = useCommunicationStore(useShallow(state => ({messages:state.messages , })));
  
  const user = useUserStore((state) => state.user);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
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
    setSearchParams.apply("id");
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (user && idParameter) {
      setSelectedChat(
        user.friends.find((el) => el._id === idParameter) as TselectedChat
      );
    }
  }, [idParameter]);
  const conversationStartingMsgs = [
    "And here it begins… a brand-new vibe, a brand-new chat. Make your move 😏",
    "Your story with this person is still unwritten… ready to write the first line? 😉",
    "This could be the start of something fun… type your first message 👇",
    "Two strangers. One chat box. Infinite possibilities 😍",
    "Every great story starts with a hello… ready to send yours?",
    "Your next favorite conversation is about to begin. Don't keep them waiting 😉",
  ];
  let randomConvoStartingMsg: string =
    "And here it begins… a brand-new vibe, a brand-new chat. Make your move 😏";
  useEffect(() => {
    randomConvoStartingMsg =
      conversationStartingMsgs[
        Math.floor(Math.random() * conversationStartingMsgs.length)
      ];
  }, []);

  if (!user) {
    return;
  }
  const filteredChats: Chat[] = chats.filter((chat) =>
    chat.conversationName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (user && searchQuery) {
    filteredFriends = user.friends.filter((friend) =>
      friend.firstName
        .concat(" ", friend.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }
  const handleRightClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      chatId,
    });
  };

  const handleContextAction = (action: string, chatId: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat._id === chatId) {
          switch (action) {
            case "pin":
              return {
                ...chat,
                isPinned: chat.isPinned,
              };
            case "mute":
              return { ...chat, isMuted: !chat.isMuted };
            case "delete":
              return chat; // In real app, would remove from list
            default:
              return chat;
          }
        }
        return chat;
      })
    );
    setContextMenu(null);
  };
  interface IackData {
    tempId:string;
    messageId:string;
  }
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat && socket && user) {
      const message: IMessage = {
        _id: Date.now().toString(),
        senderId: user._id,
        content: newMessage,
        timestamp: new Date(),
        conversationId: Date.now().toString(),
        type: "text",
      };
      socket.emit(
        "send_msg",
        { ...message, userName: selectedChat.userName },
        (ackData:IackData) => {
          console.log(ackData);
         }
      );
      setNewMessage("");
    }
  };
  function truncateText(text: string, maxLength: number = 50): string {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }
  const handleAddFriend = async () => {
    if (friendUsername.trim() && socket) {
      // Simulate sending friend request
      if (user.userName === friendUsername) {
        return toast.error("Abe sale Khud ko kon Request bhejta hai!!");
      }
      console.log(user._id, user.firstName, user.lastName, user.userName);
      const response = await sendFriendRequest({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
      },friendUsername);
      if (response === "Request Sent") {
        toast(`Sent Request to ${friendUsername}`);
        setFriendUsername("");
        setIsAddFriendOpen(false);
      } else {
        toast.error(truncateText(response as string, 50));
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Toaster></Toaster>
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Gufta-Gu
            </h1>

            <Link to={"/profile"}>
              <UserRoundPen className="h-4 w-4" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations to start with.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex gap-2">
            <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              </DialogTrigger>
              <DialogContent className="animate-fade-in-up">
                <DialogHeader>
                  <DialogTitle>Add New Friend</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter friend's UserName"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    className="bg-input"
                  />
                  <Button
                    onClick={handleAddFriend}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Send Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              variant="outline"
              className="border-border bg-transparent"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 || filteredFriends.length > 0 ? (
            <div className="p-2">
              {/* Pinned Chats */}
              {filteredChats.length > 0 &&
                filteredChats.filter((chat) => chat.isPinned).length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </div>
                    {filteredChats
                      .filter((chat) => chat.isPinned)
                      .map((chat) => (
                        <ChatItem
                          key={chat._id}
                          chat={chat}
                          isSelected={selectedChat?._id === chat._id}
                          onClick={() => setSelectedChat(chat)}
                          onRightClick={(e) => handleRightClick(e, chat?._id)}
                        />
                      ))}
                  </div>
                )}

              {/* Regular Chats */}
              <div className="mb-4">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Direct Messages
                </div>
                {filteredChats
                  .filter((chat) => chat.type === "direct" && !chat.isPinned)
                  .map((chat) => (
                    <ChatItem
                      key={chat._id}
                      chat={chat}
                      isSelected={selectedChat?._id === chat._id}
                      onClick={() => setSelectedChat(chat)}
                      onRightClick={(e) => handleRightClick(e, chat._id)}
                    />
                  ))}
              </div>

              {/* Group Chats */}
              {filteredChats.length > 0 &&
                filteredChats.filter((chat) => chat.type === "group").length >
                  0 && (
                  <div>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Groups
                    </div>
                    {filteredChats
                      .filter((chat) => chat.type === "group" && chat.isPinned)
                      .map((chat) => (
                        <ChatItem
                          key={chat._id}
                          chat={chat}
                          isSelected={selectedChat?._id === chat._id}
                          onClick={() => setSelectedChat(chat)}
                          onRightClick={(e) => handleRightClick(e, chat._id)}
                        />
                      ))}
                  </div>
                )}
              {searchQuery.length > 0 &&
                filteredFriends.map((friend) => (
                  <ChatItem
                    key={friend._id}
                    isSelected={selectedChat?._id === friend._id}
                    onClick={() => setSelectedChat(friend)}
                    chat={friend}
                    onRightClick={(e) => handleRightClick(e, friend._id)}
                  />
                ))}
            </div>
          ) : (
            <div className="p-2">
              <h1 className="StoryScript text-4xl text-center text-[#77ad6c] leading-20">
                You Haven't Started Using{" "}
                <strong className="text-green-800">Gufta-Gu</strong>, Go and
                Start conversation with Your Friends. . .
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col animate-slide-in-right">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedChat.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {selectedChat.firstName
                        ? selectedChat.firstName[0].concat(
                            selectedChat.lastName
                              ? selectedChat.lastName[0]
                              : ""
                          )
                        : selectedChat.conversationName
                        ? selectedChat.conversationName[0]
                        : ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-card-foreground">
                      {selectedChat.firstName
                        ? selectedChat.firstName.concat(
                            " ",
                            selectedChat.lastName ? selectedChat.lastName : ""
                          )
                        : selectedChat.conversationName}
                    </h2>
                    {/* // TODO */}
                    {/* <p className="text-sm text-muted-foreground">
                      {selectedChat.
                        ? "Online"
                        : "Last seen 2 hours ago"}
                    </p> */}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderId === user?._id
                        ? "justify-end"
                        : "justify-start"
                    } animate-fade-in-up`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?._id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground border border-border"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === user?._id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative top-46 max-w-xl mx-auto">
                  <SplitText
                    threshold={0.3}
                    text={randomConvoStartingMsg} // stable value
                    className="py-7 font-semibold text-5xl SiriVennela text-[#2e6d1d]"
                    delay={100}
                  />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewMessage(e.target.value)
                    }
                    onKeyPress={(
                      e: React.KeyboardEvent<HTMLTextAreaElement>
                    ) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-32 resize-none bg-input border-border"
                  />
                </div>
                <Button size="sm" variant="ghost">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center animate-fade-in-up">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome to Gufta-Gu
              </h3>
              <p className="text-muted-foreground">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-popover border border-border rounded-md shadow-lg py-2 z-50 animate-fade-in-up"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleContextAction("pin", contextMenu.chatId)}
            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
          >
            <Pin className="h-4 w-4" />
            <span>Pin Chat</span>
          </button>
          <button
            onClick={() => handleContextAction("mute", contextMenu.chatId)}
            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
          >
            <VolumeX className="h-4 w-4" />
            <span>Mute Chat</span>
          </button>
          <button
            onClick={() => handleContextAction("archive", contextMenu.chatId)}
            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
          >
            <Archive className="h-4 w-4" />
            <span>Archive</span>
          </button>
          <hr className="my-1 border-border" />
          <button
            onClick={() => handleContextAction("delete", contextMenu.chatId)}
            className="w-full px-4 py-2 text-left hover:bg-destructive hover:text-destructive-foreground flex items-center space-x-2 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Chat</span>
          </button>
        </div>
      )}
    </div>
  );
}
