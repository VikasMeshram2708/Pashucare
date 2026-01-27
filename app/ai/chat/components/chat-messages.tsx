import { SelectMessage } from "@/db/schema/messages";
import MessageInput from "./message-input";
import { getMessages } from "@/actions/get-messages";

export default async function ChatMessages({ chatId }: { chatId: string }) {
  const result = await getMessages({ chatId });

  const messages = result.metadata?.dbMessages;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* <pre>{JSON.stringify(messages, null, 2)}</pre> */}
      <MessageInput messages={messages as SelectMessage[]} />
    </div>
  );
}
