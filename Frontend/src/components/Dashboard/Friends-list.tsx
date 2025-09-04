import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Search, UserMinus, Pin, VolumeX, Check, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  acceptFriendRequest,
  updateFriendList,
  rejectFriendRequest,
  removeFriend,
} from "@/Services/user.api";
import { type IfriendRequests } from "@/Store/user.store";
import useGlobalStore from "@/Store/global.store";
import useUserStore from "@/Store/user.store";
import { useShallow } from "zustand/react/shallow";

export function FriendsList() {
  const [query, setQuery] = useState("");
  const [friendsRequest, setFriendsRequest] = useState<
    IfriendRequests[] | null
  >(null);
  const socket = useGlobalStore((state) => state.socket);
  const { user, setFriends } = useUserStore(
    useShallow((state) => ({ user: state.user, setFriends: state.setFriends }))
  );

  const filtered = useMemo(() => {
    if (user && user.friends.length > 0) {
      const q = query.toLowerCase().trim();
      if (!q) return user.friends;
      return user.friends.filter(
        (f) =>
          f.firstName.concat(" ", f.lastName).toLowerCase().includes(q) ||
          f.userName.toLowerCase().includes(q)
      );
    }
  }, [query, user?.friends]);

  useEffect(() => {
    if (!socket) return;

    const handleReceivedRequest = (userName: string) => {
      updateFriendList(setFriendsRequest, setFriends);
      toast(`You Got Request from ${userName}`);
    };

    socket.on("receivedRequest", handleReceivedRequest);

    // Cleanup function to remove the listener when component unmounts
    return () => {
      socket.off("receivedRequest", handleReceivedRequest);
    };
  }, [socket]); // Only re-run if socket changes

  const acceptTheFriendRequest = async (id: string) => {
    const res = await acceptFriendRequest(id);
    setFriends(res);
    setFriendsRequest((state) => (state ?? []).filter((el) => el._id != id));
    toast("Friend Request Accepted SuccessFully!!");
  };

  const handleRemoveFriend = async (id: string) => {
    if (user) {
      const res = await removeFriend(id);
      if(res === "Friend Removed SuccessFully!!"){
        setFriends(user.friends.filter((el) => el._id != id));        
        toast(res);
      }else{
        toast(res);
      }
    } else {
      toast.error("Please Login First!!");
    }
  };

  const handleRejectRequest = async (id: string) => {
    const res = await rejectFriendRequest(id);
    setFriendsRequest((state) => (state ?? []).filter((el) => el._id !== id));

    toast(res);
  };

  return (
    <>
      <Toaster></Toaster>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Connections
              </p>
              <CardTitle className="text-base sm:text-lg">
                Friends ({user?.friends.length})
              </CardTitle>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or handle"
                className="pl-8"
                aria-label="Search friends"
              />
            </div>
          </CardHeader>

          {friendsRequest && (
            <div className="px-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="text-sm font-medium">
                    Pending Requests
                    <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {friendsRequest.length}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Review and respond
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <AnimatePresence initial={false}>
                  {friendsRequest.map((user) => (
                    <motion.div
                      key={user.userName}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 ring-2 ring-primary/20">
                          <AvatarImage
                            src="/friend-avatar.png"
                            alt={`${user.firstName} ${user.lastName} avatar`}
                          />
                          <AvatarFallback>
                            {[user.firstName, user.lastName]
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{user.userName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 bg-transparent"
                          onClick={() => {
                            acceptTheFriendRequest(user._id);
                          }}
                          aria-label={`Accept ${user.firstName} ${user.lastName}`}
                          title="Accept Request"
                        >
                          <Check className="size-4" />
                          Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleRejectRequest(user._id)}
                          aria-label={`Decline ${user.firstName} ${user.lastName}`}
                          title="Decline Request"
                        >
                          <X className="size-4" />
                          Decline
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <CardContent className="space-y-2">
            <AnimatePresence initial={false}>
              {filtered &&
                filtered.map((f) => (
                  <motion.div
                    key={f._id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="group flex items-center justify-between rounded-md border bg-card/60 px-3 py-2 ring-0 transition hover:bg-card hover:shadow-sm hover:ring-1 hover:ring-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage
                          src="/friend-avatar.png"
                          alt={`${f.firstName} ${f.lastName} avatar`}
                        />
                        <AvatarFallback>
                          {[f.firstName, f.lastName]
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {f.firstName} {f.lastName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                              f.isOnline
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                            aria-label={f.isOnline ? "Online" : "Offline"}
                          >
                            <span
                              className={`inline-block size-1.5 rounded-full ${
                                f.isOnline
                                  ? "bg-primary"
                                  : "bg-muted-foreground/50"
                              }`}
                            />
                            {f.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{f.userName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 transition group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Pin chat"
                        onClick={() =>
                          toast(
                            `${f.firstName} ${f.lastName} pinned (UI only).`
                          )
                        }
                        title="Pin Chat"
                      >
                        <Pin className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Mute chat"
                        onClick={() =>
                          toast(`${f.firstName} ${f.lastName} muted (UI only).`)
                        }
                        title="Mute Chat"
                      >
                        <VolumeX className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleRemoveFriend(f._id)}
                        aria-label={`Remove ${f.firstName} ${f.lastName}`}
                        title="Remove Friend"
                      >
                        <UserMinus className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {filtered && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed bg-muted/30 py-10 text-center">
                <Search className="size-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No friends match your search.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
