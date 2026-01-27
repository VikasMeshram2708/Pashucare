import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SelectMessage } from "@/db/schema/messages";
import { cn } from "@/lib/utils";

export default function MessageInput({
  messages,
}: {
  messages: SelectMessage[];
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {messages?.map((msg) => (
        <div
          key={msg.id}
          className={cn(msg.role === "user" ? "self-end" : "self-end")}
        >
          <div
            className={cn(
              msg.role === "assistant" &&
                "text-[13px] sm:text-[17px] leading-4 sm:leading-8 [&_p]:mb-2 sm:[&_p]:mb-4 [&_p]:mt-2 sm:[&_p]:mt-4 [&_h1]:mb-2 sm:[&_h1]:mb-4 [&_h1]:mt-3 sm:[&_h1]:mt-6 [&_h2]:mb-2 sm:[&_h2]:mb-4 [&_h2]:mt-3 sm:[&_h2]:mt-6 [&_h3]:mb-2 sm:[&_h3]:mb-4 [&_h3]:mt-3 sm:[&_h3]:mt-6 [&_ul]:my-2 sm:[&_ul]:my-4 [&_ol]:my-2 sm:[&_ol]:my-4 [&_li]:my-1 sm:[&_li]:my-2 overflow-wrap-break-word",
            )}
          >
            <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
          </div>
        </div>
      ))}
    </div>
  );
}
