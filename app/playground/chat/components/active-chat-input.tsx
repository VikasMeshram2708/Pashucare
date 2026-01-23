"use client";

import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function ActiveChatInput({
  initialMessages,
}: {
  initialMessages: Array<UIMessage>;
}) {
  // console.log("it", initialMessages);
  const [inputValue, setInputValue] = useState("");

  // get params
  const { id: chatId } = useParams();

  const { messages, sendMessage, setMessages } = useChat({
    messages: initialMessages,
    onFinish: async ({ message }) => {
      if (!chatId) return;
      // Extract assistant text correctly
      const assistantText = message.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("");

      // Get last user message from messages history
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");

      const userText =
        lastUserMessage?.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("") ?? "";

      const payload = [
        {
          role: "user",
          text: userText,
        },
        {
          role: "assistant",
          text: assistantText,
        },
      ];

      // console.log("FINAL PAYLOAD", payload);
      try {
        const res = await fetch("/api/chat/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId, message: payload }),
        });
        const json = await res.json();
        console.log("json", json);
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll while streaming (ChatGPT-like behavior)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    sendMessage({
      text: inputValue,
    });

    setInputValue("");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 px-4 py-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          const content = msg.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("");

          if (!content) return null;

          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                index === 0 && "mt-4",
                isUser ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-xl px-4 py-3 text-[15px] leading-6",
                  isUser
                    ? "bg-blue-500 text-white"
                    : "bg-muted text-foreground",
                )}
              >
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0">{children}</p>
                    ),
                  }}
                >
                  {content}
                </Markdown>
              </div>
            </div>
          );
        })}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input (fixed at bottom) */}
      <div className="bg-background px-4 py-3">
        <form onSubmit={onSubmit}>
          <div className="flex items-center gap-2 rounded-full border px-3 py-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              type="text"
              placeholder="Type a message..."
              className="w-full bg-transparent px-3 py-2 text-[15px] focus-visible:outline-none"
            />

            <Button
              disabled={!inputValue.trim()}
              type="submit"
              size="icon"
              className="rounded-full"
            >
              <SendIcon />
            </Button>
          </div>
        </form>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Pashucare AI can make mistakes.
        </p>
      </div>
    </div>
  );
}
