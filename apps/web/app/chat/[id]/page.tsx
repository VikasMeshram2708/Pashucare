// app/chat/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import ActiveChatInput from "../components/active-chat-input";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Loader2Icon } from "lucide-react";

export default function ChatIdPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();

  // Check if chat exists
  const chat = useQuery(
    api.chats.getChatById,
    user?.id && id ? { chatId: id as Id<"chats"> } : "skip",
  );

  // Redirect if chat doesn't exist (deleted)
  useEffect(() => {
    if (chat === null) {
      router.replace("/chat");
    }
  }, [chat, router]);

  if (!user) return <div>Please sign in</div>;

  // Loading state
  if (chat === undefined) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Chat was deleted or doesn't exist
  if (chat === null) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ActiveChatInput id={id as Id<"chats">} autoTrigger={true} />
    </div>
  );
}
