"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import useUserStore from "@/Store/user.store";

export function ProfileCard() {
  const user = useUserStore(state => state.user);
  return (
    <>
      <Toaster></Toaster>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User2 className="size-5 text-primary" />
              Profile
            </CardTitle>
            <Badge variant="secondary">Active</Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src="/diverse-profile-avatars.png"
                alt="User avatar"
              />
              <AvatarFallback>{[user?.firstName,user?.lastName]
                          .map((p) => p?.[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="text-lg font-medium leading-none">{user?.firstName} {user?.lastName}</div>
              <div className="text-sm text-muted-foreground">@{user?.userName}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="relative inline-flex size-2 rounded-full bg-primary">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50"></span>
                </span>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => toast("Profile editor coming soon.")}
            >
              <Edit className="size-4" />
              Edit Profile
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
}
