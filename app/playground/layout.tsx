import { SidebarProvider } from "@/components/ui/sidebar";
import PlaySidebar from "./component/play-sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getChats } from "@/actions/get-chats";

export default async function PlayGroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const rows = await getChats({ userId: user?.id });
  const chats = rows?.metadata?.data;
  return (
    <SidebarProvider>
      <div className="flex w-full">
        {/* Sidebar */}

        <PlaySidebar chats={chats ?? []} />

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}
