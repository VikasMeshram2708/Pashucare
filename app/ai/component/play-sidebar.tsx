"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BotIcon,
  ClipboardPlusIcon,
  EllipsisVerticalIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  PlusIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { SelectChats } from "@/db/schema/chat";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";

import PlayRename from "./play-rename";
import PlayDelete from "./play-delete";
import { UserButton } from "@clerk/nextjs";

type SidebarLink = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

const sidebarLinks: readonly SidebarLink[] = [
  {
    href: "/ai",
    label: "Home",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/ai/chat",
    label: "Chats",
    icon: MessageCircleIcon,
  },
  {
    href: "/ai/health-report",
    label: "Health Reports",
    icon: ClipboardPlusIcon,
  },
] as const;

export default function PlaySidebar({
  initialChats,
}: {
  initialChats: Array<SelectChats>;
}) {
  const { state } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [chats, setChats] = useState<SelectChats[]>(initialChats);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const isCollapsed = state === "collapsed";

  // Extract active chat ID from current pathname
  const activeChatId = pathname.match(/\/ai\/chat\/([^\/]+)/)?.[1];

  const loadMoreChats = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/chats?page=${nextPage}&limit=20`);
      const result = await response.json();

      if (result.success) {
        setChats((prev) => [...prev, ...result.metadata.data]);
        setPage(nextPage);
        setHasMore(result.metadata.hasMore);
      }
    } catch (error) {
      console.error("Failed to load more chats:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Function to refresh chats - can be called from outside
  const refreshChats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chats?page=1&limit=20`);
      const result = await response.json();

      if (result.success) {
        setChats(result.metadata.data);
        setPage(1);
        setHasMore(result.metadata.hasMore);
      }
    } catch (error) {
      console.error("Failed to refresh chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for custom event to refresh chats
  useEffect(() => {
    const handleNewChat = () => {
      refreshChats();
    };

    const handleChatDeleted = (event: CustomEvent) => {
      const { chatId } = event.detail;
      // Immediately remove the deleted chat from state
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      // Also refresh to get updated data
      refreshChats();
    };

    // Add event listeners
    window.addEventListener("newChatCreated", handleNewChat);
    window.addEventListener("chatDeleted", handleChatDeleted as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener("newChatCreated", handleNewChat);
      window.removeEventListener(
        "chatDeleted",
        handleChatDeleted as EventListener,
      );
    };
  }, [refreshChats]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreChats();
        }
      },
      { threshold: 1.0 },
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, page, loadMoreChats]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            {isCollapsed ? <SidebarTrigger /> : <BotIcon />}
            {!isCollapsed && (
              <>
                <h1 className="text-lg md:text-2xl font-bold">
                  <Link href="/" prefetch>
                    PashuCare AI
                  </Link>
                </h1>
                <SidebarTrigger />
              </>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* quick actions */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                onClick={() => router.push("/ai/chat")}
              >
                <PlusIcon />
                New chat
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                onClick={() => toast.warning("Coming soon!")}
              >
                <SearchIcon />
                Search chat
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* quick links */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick links</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              {sidebarLinks.map((item) => (
                <SidebarMenuButton key={item.label} asChild>
                  <Link prefetch href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* chats */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Your chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats?.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div className="flex items-center justify-between w-full">
                        <SidebarMenuButton
                          isActive={chat.id === activeChatId}
                          asChild
                          className="flex-1"
                        >
                          <Link prefetch href={`/ai/chat/${chat.id}`}>
                            <span
                              className="truncate"
                              title={chat.title as string}
                            >
                              {chat.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm">
                              <EllipsisVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <PlayDelete chatId={chat?.id} />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <PlayRename
                                chatId={chat.id}
                                title={chat.title as string}
                              />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))}
                  {hasMore && (
                    <SidebarMenuItem>
                      <div
                        ref={loadMoreRef}
                        className="flex justify-center py-2"
                      >
                        {loading ? (
                          <div className="text-sm text-muted-foreground">
                            Loading...
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Scroll for more
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarGroup>
        )}
      </SidebarContent>
      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <UserButton
                appearance={{
                  elements: {
                    userButtonBox: "w-full text-white flex justify-start",
                  },
                }}
                showName={isCollapsed ? false : true}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
