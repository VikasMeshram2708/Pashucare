"use client";

import { LogoFn } from "@/components/header";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import SidePanelQuickActions from "./sp-quick-actions";
import ChatsList from "./chats-list";

import { UserButton } from "@clerk/nextjs";

export default function ChatSidePanel() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-primary backdrop-blur-lg shadow-lg"
    >
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <div
              className={
                isCollapsed
                  ? "flex items-center justify-center"
                  : "flex items-center justify-between"
              }
            >
              {!isCollapsed && <LogoFn className="lg:w-36" />}
              <SidebarTrigger className="cursor-pointer text-primary" />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidePanelQuickActions isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent>
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Your chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <ChatsList />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-center">
            <UserButton
              showName
              appearance={{
                elements: {
                  userButtonBox: "text-white",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
