import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidePanel from "./components/chat-sidepanel";
import ChatHeader from "./components/chat-header";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="flex">
      <ChatSidePanel />
      <main className="p-4 flex-1 flex-col">
        <ChatHeader />
        <div>{children}</div>
      </main>
    </SidebarProvider>
  );
}
