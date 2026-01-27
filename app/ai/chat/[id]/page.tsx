import { notFound } from "next/navigation";
import ActiveChatInput from "../components/active-chat-input";
import { getMessages } from "@/actions/get-messages";
import { SelectMessage } from "@/db/schema/messages";
import { UIMessage } from "ai";

function toUIMessages(rows: Array<SelectMessage>): Array<UIMessage> {
  // Reverse the order to show messages chronologically (oldest first)
  return rows.reverse().map((r) => ({
    id: r.id,
    role: r.role,
    parts: [{ type: "text", text: r.text }],
  }));
}

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: chatId } = await params;

  if (!chatId) {
    notFound();
  }

  const dbMessages = await getMessages({ chatId });
  const initialMessages = dbMessages.metadata?.dbMessages ?? [];
  const myMessages = toUIMessages(initialMessages);

  // console.log("initialMessages", initialMessages);

  return (
    <div className="flex h-[95svh] max-w-5xl mx-auto flex-col">
      <ActiveChatInput initialMessages={myMessages} />
    </div>
  );
}
