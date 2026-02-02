// components/active-chat-input.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";
import { SendIcon, StopCircleIcon } from "lucide-react";
import {
  FormEvent,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MessageList, { Message } from "./message-list";

interface ActiveChatInputProps {
  id: Id<"chats">;
  initialMessages?: Array<{
    _id?: Id<"messages">;
    role: "user" | "assistant" | "system";
    content: string;
    status?: "pending" | "streaming" | "sent" | "error";
    createdAt?: number;
  }>;
  autoTrigger?: boolean;
}

export default function ActiveChatInput({
  id,
  autoTrigger = false,
}: ActiveChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingMessageId, setPendingMessageId] =
    useState<Id<"messages"> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoTriggered = useRef(false);

  // Convex mutations
  const createMessage = useMutation(api.chats.createMessage);
  const updateMessage = useMutation(api.chats.updateMessage);

  // Paginated Query
  const {
    results: paginatedMessages,
    loadMore,
    status: paginationStatus,
  } = usePaginatedQuery(
    api.chats.getChatMessages,
    { chatId: id },
    { initialNumItems: 20 },
  );

  // Normalize messages
  const messages = useMemo(() => {
    return (paginatedMessages || []) as Message[];
  }, [paginatedMessages]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);

    if (pendingMessageId && streamingContent) {
      updateMessage({
        messageId: pendingMessageId,
        content: streamingContent,
        status: "sent",
      });
    }

    setPendingMessageId(null);
    setStreamingContent("");
    textareaRef.current?.focus();
  }, [pendingMessageId, streamingContent, updateMessage]);

  const sendMessage = useCallback(
    async (content: string, skipUserMessage = false) => {
      if (!content.trim()) return;

      setError(null);
      setIsStreaming(true);
      setStreamingContent("");

      let assistantMessageId: Id<"messages"> | null = null;
      let accumulatedContent = "";

      try {
        // 1. Save user message to Convex (unless skipping for auto-trigger)
        if (!skipUserMessage) {
          await createMessage({
            chatId: id,
            role: "user",
            content: content.trim(),
          });
        }

        // 2. Create pending assistant message
        assistantMessageId = await createMessage({
          chatId: id,
          role: "assistant",
          content: "",
        });
        setPendingMessageId(assistantMessageId);

        // 3. Update status to streaming
        await updateMessage({
          messageId: assistantMessageId,
          status: "streaming",
        });

        // 4. Start API stream
        abortControllerRef.current = new AbortController();

        // Used for the chat context in API request.
        // We pass the currently loaded messages + new user message.
        // Reverse them because `messages` from paginatedQuery is newest-first,
        // but the API/LLM likely expects oldest-first (history).
        const historyForApi = [...messages].reverse().map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(`/api/chat/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...historyForApi,
              { role: "user", content: content.trim() },
            ],
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // 5. Stream chunks
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          setStreamingContent(accumulatedContent);

          // Real-time update to Convex
          if (assistantMessageId) {
            await updateMessage({
              messageId: assistantMessageId,
              content: accumulatedContent,
              append: false,
            });
          }
        }

        // 6. Mark as complete
        if (assistantMessageId) {
          await updateMessage({
            messageId: assistantMessageId,
            content: accumulatedContent,
            status: "sent",
          });
        }

        setStreamingContent("");
        setPendingMessageId(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        if (assistantMessageId) {
          await updateMessage({
            messageId: assistantMessageId,
            status: "error",
            content: accumulatedContent || "Failed to generate response",
          });
        }

        console.error("Chat error:", err);
      } finally {
        setIsStreaming(false);
        textareaRef.current?.focus();
      }
    },
    [id, messages, createMessage, updateMessage],
  );

  // Auto-trigger AI response
  useEffect(() => {
    if (
      autoTrigger &&
      !hasAutoTriggered.current &&
      messages.length > 0 &&
      !isStreaming
    ) {
      // NOTE: With reverse order, msg[0] is the NEWEST message.
      const lastMessage = messages[0];
      if (lastMessage && lastMessage.role === "user") {
        hasAutoTriggered.current = true;
        sendMessage(lastMessage.content, true);
      }
    }
  }, [autoTrigger, messages, isStreaming, sendMessage]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isStreaming || !inputValue.trim()) return;

      const message = inputValue;
      setInputValue("");
      sendMessage(message, false);
    },
    [inputValue, isStreaming, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isStreaming && inputValue.trim()) {
          sendMessage(inputValue, false);
          setInputValue("");
        }
      }
    },
    [inputValue, isStreaming, sendMessage],
  );

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Messages Area - Delegated to MessageList */}
      <MessageList
        messages={messages}
        isLoadingMore={paginationStatus === "LoadingMore"}
        loadMore={() => loadMore(20)}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
        error={error}
        onDismissError={() => setError(null)}
      />

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur-sm p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isStreaming ? "AI is thinking..." : "Type a message..."
              }
              disabled={isStreaming}
              rows={1}
              className={cn(
                "min-h-13 max-h-50 resize-none",
                "rounded-xl border bg-background px-4 py-3.5 pr-12",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-all duration-200",
              )}
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground pointer-events-none tabular-nums">
              {inputValue.length > 0 && `${inputValue.length}`}
            </div>
          </div>

          {isStreaming ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleStop}
              className="h-13 w-13 shrink-0 rounded-xl"
            >
              <StopCircleIcon className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim()}
              className="h-13 w-13 shrink-0 rounded-xl bg-primary hover:bg-primary/90"
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          )}
        </form>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Press{" "}
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono">Enter</kbd> to
          send,{" "}
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono">
            Shift + Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
