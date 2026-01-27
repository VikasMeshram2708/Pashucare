"use client";

import { Button } from "@/components/ui/button";
import { SendIcon, Square } from "lucide-react";
import { FormEvent, useEffect, useRef, useState, useCallback } from "react";
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const didBootstrapRef = useRef(false);
  const didHydrateRef = useRef(false);

  const { id: chatId } = useParams<{ id: string }>();

  const {
    messages: chatMessages,
    sendMessage,
    setMessages: setChatMessages,
    stop,
  } = useChat({
    id: chatId,
    onFinish: async ({ message }) => {
      if (!chatId) return;
      setLoading(false);

      const assistantText = getText(message);
      const lastUser = [...chatMessages]
        .reverse()
        .find((m) => m.role === "user");
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
      chatMessages.length === 0 &&
      !didHydrateRef.current
    ) {
      setChatMessages(initialMessages);
      didHydrateRef.current = true;

      // Only mark bootstrap as done if we have a complete conversation (user + assistant)
      const hasCompleteConversation = initialMessages.some(
        (msg) => msg.role === "assistant",
      );
      if (hasCompleteConversation) {
        didBootstrapRef.current = true;
      }
    }
  }, [initialMessages, setChatMessages, chatMessages.length]);

  /* ───────── Bootstrap AI ONCE ───────── */
  useEffect(() => {
    if (!chatMessages.length) return;
    if (didBootstrapRef.current) return;

    const last = chatMessages.at(-1);
    const secondLast = chatMessages.at(-2);

    // Only bootstrap if the last message is from user AND there's no assistant response yet
    // This allows AI to respond even when redirecting from /chat
    if (
      last?.role === "user" &&
      (!secondLast || secondLast.role !== "assistant")
    ) {
      didBootstrapRef.current = true;
      sendMessage({ text: getText(last) });
    }
  }, [chatMessages, sendMessage]);

  /* ───────── Auto-scroll ───────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ───────── Load more messages (infinite scroll) ───────── */
  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore || !chatId) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/messages?chatId=${chatId}&page=${nextPage}&limit=50`,
      );
      const result = await response.json();

      if (result.success) {
        const newMessages = result.metadata.dbMessages
          .reverse()
          .map((r: { id: string; role: string; text: string }) => ({
            id: r.id,
            role: r.role,
            parts: [{ type: "text", text: r.text }],
          }));

        setChatMessages([...newMessages, ...chatMessages]);
        setPage(nextPage);
        setHasMore(result.metadata.hasMore);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, chatId, chatMessages, setChatMessages]);

  useEffect(() => {
    if (!topRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreMessages();
        }
      },
      { threshold: 1.0 },
    );

    observerRef.current.observe(topRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMoreMessages]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    sendMessage({ text: inputValue });
    setInputValue("");
  }

  function handleStop() {
    stop();
    setLoading(false);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full min-w-0">
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4 sm:space-y-6 sm:px-4 sm:py-6">
        {hasMore && (
          <div ref={topRef} className="flex justify-center py-2">
            {loading ? (
              <div className="text-xs sm:text-sm text-muted-foreground">
                Loading older messages...
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-muted-foreground">
                Scroll up for more
              </div>
            )}
          </div>
        )}
        {chatMessages.map((msg: UIMessage, index: number) => {
          const isUser = msg.role === "user";
          const content = getText(msg);

          if (!content) return null;

          // Skip duplicate user messages (prevent rendering the same message twice)
          // This happens when redirecting from /chat page where message is loaded from DB
          // and then bootstrap sends it again
          if (isUser && index > 0) {
            const prevMsg = chatMessages[index - 1];
            const prevContent = getText(prevMsg);
            if (prevMsg?.role === "user" && prevContent === content) {
              return null; // Skip duplicate
            }
          }

          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full min-w-0",
                index === 0 && "mt-2 sm:mt-4",
                isUser ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] sm:max-w-[75%] rounded-xl px-2 py-1.5 sm:px-4 sm:py-3 min-w-0 break-words",
                  isUser
                    ? "bg-blue-500 text-white text-[13px] sm:text-[15px] leading-4 sm:leading-6"
                    : "text-foreground text-[13px] sm:text-[17px] leading-4 sm:leading-7",
                )}
              >
                <div
                  className={cn(
                    !isUser &&
                      "text-[13px] sm:text-[17px] leading-4 sm:leading-8 [&_p]:mb-2 sm:[&_p]:mb-4 [&_p]:mt-2 sm:[&_p]:mt-4 [&_h1]:mb-2 sm:[&_h1]:mb-4 [&_h1]:mt-3 sm:[&_h1]:mt-6 [&_h2]:mb-2 sm:[&_h2]:mb-4 [&_h2]:mt-3 sm:[&_h2]:mt-6 [&_h3]:mb-2 sm:[&_h3]:mb-4 [&_h3]:mt-3 sm:[&_h3]:mt-6 [&_ul]:my-2 sm:[&_ul]:my-4 [&_ol]:my-2 sm:[&_ol]:my-4 [&_li]:my-1 sm:[&_li]:my-2 overflow-wrap-break-word",
                  )}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="bg-background px-2 py-2 sm:px-4 sm:py-3 border-t flex-shrink-0">
        <form onSubmit={onSubmit}>
          <div className="flex items-center gap-1 sm:gap-2 rounded-full border px-2 py-1.5 sm:px-3 sm:py-2 min-w-0">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent px-2 py-1 sm:px-3 sm:py-2 text-[13px] sm:text-[15px] focus-visible:outline-none min-w-0"
              disabled={loading}
            />
            {loading ? (
              <Button
                type="button"
                onClick={handleStop}
                variant="destructive"
                size="icon"
                className="rounded-full h-7 w-7 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <Square className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <Button
                disabled={!inputValue.trim()}
                type="submit"
                size="icon"
                className="rounded-full h-7 w-7 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <SendIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </form>
        {loading && (
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2 text-center">
            AI is responding... Click the stop button to interrupt.
          </p>
        )}
      </div>
    </div>
  );
}
