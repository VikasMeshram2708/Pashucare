"use client";

import { LogoFn } from "@/components/header";
import { dark } from "@clerk/themes";

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
import SidePanelQuickActions from "./sp-quick-actions";
import ChatsList from "./chats-list";

import { UserButton } from "@clerk/nextjs";
import { ClipboardPlusIcon, LayoutDashboardIcon } from "lucide-react";

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

      <SidebarContent className="flex min-h-0 flex-col">
        {/* Links */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LayoutDashboardIcon />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ClipboardPlusIcon />
                  Reports Check
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chats */}
        {!isCollapsed && (
          <SidebarGroup className="flex min-h-0 flex-col">
            <SidebarGroupLabel className="text-primary">
              Your chats
            </SidebarGroupLabel>

            <SidebarGroupContent className="min-h-0 flex-1 overflow-y-auto">
              <ChatsList />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-center">
            <UserButton
              showName
              appearance={{
                theme: dark,
                elements: {
                  userButtonBox: "text-primary",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
