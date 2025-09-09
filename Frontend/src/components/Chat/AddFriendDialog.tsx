// src/components/chat/AddFriendDialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { toast } from 'sonner';
import useUserStore from '@/Store/user.store';
import { sendFriendRequest } from '@/Services/user.api';

const AddFriendDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const user = useUserStore((state) => state.user);

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
      
      await sendFriendRequest(friendData, username);
      toast.success("Friend request sent!");
      setIsOpen(false);
      setUsername("");
    } catch {
      toast.error("Failed to send friend request");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleAddFriend}>
            Send Friend Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;