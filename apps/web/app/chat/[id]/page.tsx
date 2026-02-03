import { Id } from "@/convex/_generated/dataModel";
import ActiveChatInput from "../components/active-chat-input";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Loader2Icon } from "lucide-react";

export default async function ChatIdPage({
  params,
}: {
  params: Promise<{ id: Id<"chats"> }>;
}) {
  const { id } = await params;
  const chatId = id;

  // Check if chat exists (only if ID is valid to prevent Convex crash)
  const chat = await fetchQuery(api.chats.getChatById, {
    chatId,
  });

  // Loading state
  if (chat === undefined) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ActiveChatInput id={chatId} autoTrigger={true} />
    </div>
  );
}
