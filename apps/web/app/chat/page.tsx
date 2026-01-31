"use client";

import { useUser } from "@clerk/nextjs";
import ChatInput from "./components/chat-input";

export default function ChatPage() {
  const { user } = useUser();

  return (
    <div className="relative flex h-[90dvh] flex-col bg-background">
      {/* Empty / welcome state */}
      <div className="flex flex-1 items-center justify-center px-4">
        <h1 className="text-center text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground">
          Hey
          {user?.firstName ? `, ${user.firstName}` : ""}. Ready to dive in?
        </h1>
      </div>

      {/* Input (sticky bottom) */}
      <ChatInput />
    </div>
  );
}
