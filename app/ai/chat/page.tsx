import ChatInput from "./components/chat-input";

export default function ChatPage() {
  return (
    <div className="flex h-[90svh] flex-col min-h-0 min-w-0">
      {/* Header */}
      <h1 className="text-base sm:text-lg md:text-2xl font-bold text-center py-3 sm:py-4 px-2">
        {"What's"} in your mind today?
      </h1>

      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 min-h-0">
        {/* messages go here */}
      </div>

      {/* Sticky input */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pb-2">
        <ChatInput />
      </div>
    </div>
  );
}
