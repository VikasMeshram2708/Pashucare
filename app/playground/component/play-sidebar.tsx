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
  MessageCircleIcon,
  PlusIcon,
  SearchIcon,
  TableOfContentsIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { SelectChats } from "@/db/schema/chat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
    href: "/playground",
    label: "Home",
    icon: TableOfContentsIcon,
  },
  {
    href: "/playground/chat",
    label: "Chats",
    icon: MessageCircleIcon,
  },
  {
    href: "/playground/health-report",
    label: "Health Reports",
    icon: ClipboardPlusIcon,
  },
] as const;

export default function PlaySidebar({ chats }: { chats: Array<SelectChats> }) {
  const { state } = useSidebar();
  const router = useRouter();

  const isCollapsed = state === "collapsed";

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
                onClick={() => router.push("/playground/chat")}
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
                        <SidebarMenuButton asChild className="flex-1">
                          <Link prefetch href={`/playground/chat/${chat.id}`}>
                            {chat.title}
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
                            <DropdownMenuItem>
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
