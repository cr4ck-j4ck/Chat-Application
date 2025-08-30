import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export default function AuthHeader() {
  return (
      <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Gufta-Gu
            </h1>
          </div>
          <Badge variant="secondary" className="mb-2">
            Join the Conversation
          </Badge>
          <p className="text-muted-foreground">
            Connect with people who share your interests
          </p>
        </div>
  );
}
