"use client";

import { SearchIcon, SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export default function SidePanelQuickActions({
  isCollapsed,
}: {
  isCollapsed: boolean;
}) {
  const router = useRouter();
  return (
    <SidebarGroup>
      {!isCollapsed && (
        <SidebarGroupLabel className="text-primary">
          Quick actions
        </SidebarGroupLabel>
      )}

      <SidebarGroupContent
        className={
          isCollapsed
            ? "flex flex-col items-center gap-3 px-0 py-2"
            : "space-y-4 px-2"
        }
      >
        <Button
          type="button"
          onClick={() => router.push("/chat")}
          size={isCollapsed ? "icon" : "default"}
          className={isCollapsed ? "size-7 rounded-full" : "rounded-full"}
        >
          <SquarePenIcon className="size-4" />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={isCollapsed ? "icon" : "default"}
              className={
                isCollapsed ? "size-7 rounded-full p-0" : "rounded-full"
              }
            >
              <SearchIcon className="size-4" />
              {!isCollapsed && <span className="ml-2">Search chats</span>}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-muted-foreground">
                Search chats
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-2">
              <Input type="search" placeholder="Search here..." />
              <div className="flex items-center justify-end gap-2">
                <Button type="submit" className="rounded-full">
                  Search
                </Button>
                <DialogClose className="cursor-pointer rounded-full border border-destructive bg-destructive px-4 py-2">
                  Close
                </DialogClose>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
