"use client";

import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

function getText(message?: UIMessage): string {
  return (
    message?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""
  );
}

export default function ActiveChatInput({
  initialMessages,
}: {
  initialMessages: UIMessage[];
}) {
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const didBootstrapRef = useRef(false);
  const didHydrateRef = useRef(false);

  const { id: chatId } = useParams<{ id: string }>();

  const { messages, sendMessage, setMessages } = useChat({
    id: chatId,
    onFinish: async ({ message }) => {
      if (!chatId) return;

      const assistantText = getText(message);
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const userText = getText(lastUser);

      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message: [
            { role: "user", text: userText },
            { role: "assistant", text: assistantText },
          ],
        }),
      });
    },
  });

  /* ───────── Hydrate history ONCE ───────── */
  useEffect(() => {
    // Only hydrate if we have initial messages AND no messages are currently loaded
    // This prevents overwriting messages that are being processed by the chat hook
    if (
      initialMessages.length > 0 &&
      messages.length === 0 &&
      !didHydrateRef.current
    ) {
      setMessages(initialMessages);
      didHydrateRef.current = true;
    }
  }, [initialMessages, setMessages, messages.length]);

  /* ───────── Bootstrap AI ONCE ───────── */
  useEffect(() => {
    if (!messages.length) return;
    if (didBootstrapRef.current) return;

    const last = messages.at(-1);
    const secondLast = messages.at(-2);

    // Only bootstrap if the last message is from user AND there's no assistant response yet
    // This allows AI to respond even when redirecting from /chat
    if (
      last?.role === "user" &&
      (!secondLast || secondLast.role !== "assistant")
    ) {
      didBootstrapRef.current = true;
      sendMessage({ text: getText(last) });
    }
  }, [messages, sendMessage]);

  /* ───────── Auto-scroll ───────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    sendMessage({ text: inputValue });
    setInputValue("");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-6 px-4 py-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const content = getText(msg);

          if (!content) return null;

          // Skip duplicate user messages (prevent rendering the same message twice)
          // This happens when redirecting from /chat page where message is loaded from DB
          // and then bootstrap sends it again
          if (isUser && index > 0) {
            const prevMsg = messages[index - 1];
            const prevContent = getText(prevMsg);
            if (prevMsg?.role === "user" && prevContent === content) {
              return null; // Skip duplicate
            }
          }

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
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="bg-background px-4 py-3">
        <form onSubmit={onSubmit}>
          <div className="flex items-center gap-2 rounded-full border px-3 py-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent px-3 py-2 text-[15px] focus-visible:outline-none"
            />
            <Button disabled={!inputValue.trim()} type="submit" size="icon">
              <SendIcon />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
