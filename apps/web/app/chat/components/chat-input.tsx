"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ChatInput() {
  const [value, setValue] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("v", value);
  }

  return (
    <section className="w-full bg-background">
      <form
        onSubmit={onSubmit}
        className="
          mx-auto flex max-w-3xl items-end gap-2
          rounded-xl border p-2
          focus-within:ring-1 focus-within:ring-primary
        "
      >
        {/* Textarea */}
        <Textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          placeholder="Ask anything"
          className="min-h-10 resize-none border-0 p-2 leading-5 focus-visible:ring-0
          "
        />

        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim()}
          className="h-10 w-10 shrink-0 rounded-lg"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
