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
      router.push(`/playground/chat/${json.metadata?.chatId}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
      // TODO: empty the input
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="sticky bottom-0 bg-background">
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 rounded-full border bg-background p-2 shadow-lg">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
              type="text"
              placeholder="Type a message..."
              className="w-full bg-transparent px-4 py-3 text-lg focus-visible:outline-none"
              disabled={isLoading}
            />

            <Button
              disabled={isLoading || !inputValue.trim()}
              type="submit"
              size="icon"
              className="rounded-full"
            >
              <SendIcon />
            </Button>
          </div>
        </div>
      </form>
      <p className="text-sm text-muted-foreground text-center">
        Pashucare ai can make mistakes.{" "}
      </p>
    </>
  );
}
