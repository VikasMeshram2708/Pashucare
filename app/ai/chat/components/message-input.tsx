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
          className={cn(
            "max-w-[85%] sm:max-w-[75%]",
            msg.role === "user" ? "self-end" : "self-start",
          )}
        >
          <div
            className={cn(
              "rounded-2xl px-4 py-2 sm:px-6 sm:py-3",
              msg.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            )}
          >
            {msg.role === "assistant" ? (
              <div className="text-[13px] sm:text-[16px] leading-5 sm:leading-7 [&_p]:mb-3 [&_p]:mt-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1.5 [&_li]:leading-5 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-3 [&_strong]:font-bold [&_strong]:text-gray-800 dark:[&_strong]:text-gray-200 overflow-wrap-anywhere">
                <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
              </div>
            ) : (
              <div className="text-[13px] sm:text-[16px] leading-5 overflow-wrap-anywhere">
                {msg.text}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
