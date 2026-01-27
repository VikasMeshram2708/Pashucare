"use client";

import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ChatInput() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(false);

    console.log("data", inputValue);
    try {
      setIsLoading(true);

      // api
      const res = await fetch("/api/chat/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(
          json.errors ? json?.errors : json?.message ? json?.message : "Failed",
        );
        return;
      }
      // get the id and redirect
      router.push(`/ai/chat/${json.metadata?.chatId}`);

      // Dispatch custom event to refresh sidebar
      window.dispatchEvent(new CustomEvent("newChatCreated"));
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="sticky bottom-0 bg-background">
        <div className="px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-1 sm:gap-2 rounded-full border bg-background p-1.5 sm:p-2 shadow-lg min-w-0">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
              type="text"
              placeholder="Type a message..."
              className="w-full bg-transparent px-2 py-1.5 sm:px-4 sm:py-3 text-[13px] sm:text-lg focus-visible:outline-none min-w-0"
              disabled={isLoading}
            />

            <Button
              disabled={isLoading || !inputValue.trim()}
              type="submit"
              size="icon"
              className="rounded-full h-7 w-7 sm:h-10 sm:w-10 shrink-0"
            >
              <SendIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </form>
      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
        Pashucare ai can make mistakes.{" "}
      </p>
    </>
  );
}
