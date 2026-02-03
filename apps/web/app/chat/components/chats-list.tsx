"use client";

import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EllipsisVerticalIcon,
  SquarePenIcon,
  Trash2Icon,
  Loader2Icon,
  MessageSquareIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { cn, isValidConvexId } from "@/lib/utils";

export default function ChatsList() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string | undefined;

  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToRename, setChatToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Paginated Query for Chats
  const {
    results: rawChats,
    status,
    loadMore,
  } = usePaginatedQuery(api.chats.getUserChats, user?.id ? {} : "skip", {
    initialNumItems: 20,
  });

  const chats = rawChats.filter((chat) => isValidConvexId(chat._id));

  const deleteChat = useMutation(api.chats.softDeleteChat);
  const renameChat = useMutation(api.chats.renameChat);

  const handleDelete = async (chatId: string) => {
    if (!user?.id) return;

    try {
      await deleteChat({ chatId: chatId as Id<"chats"> });
      toast.success("Chat deleted");

      // Redirect if we're on the deleted chat's page
      if (currentChatId === chatId) {
        router.push("/chat");
      }
    } catch (error) {
      toast.error("Failed to delete chat");
      console.error(error);
    } finally {
      setChatToDelete(null);
    }
  };

  const handleRenameOpen = (chatId: string, currentName: string) => {
    setChatToRename({ id: chatId, name: currentName });
    setNewName(currentName);
  };

  const handleRenameSubmit = async () => {
    if (!user?.id || !chatToRename || !newName.trim()) return;

    setIsRenaming(true);
    try {
      await renameChat({
        chatId: chatToRename.id as Id<"chats">,
        name: newName.trim(),
      });
      toast.success("Chat renamed");
      setChatToRename(null);
      setNewName("");
    } catch (error) {
      toast.error("Failed to rename chat");
      console.error(error);
    } finally {
      setIsRenaming(false);
    }
  };

  // Infinite Scroll Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && status === "CanLoadMore") {
          loadMore(20);
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [status, loadMore]);

  // Loading state
  if (!isUserLoaded) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        Sign in to view your chats
      </div>
    );
  }

  // Loading chats initial
  if (status === "LoadingFirstPage") {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <MessageSquareIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No chats yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Start a new conversation
        </p>
      </div>
    );
  }

  return (
    <>
      <SidebarMenu className="px-2">
        {chats.map((chat) => {
          const isActive = currentChatId === chat._id;
          return (
            <SidebarMenuItem key={chat._id}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  "group/primitive",
                  isActive ? "border-l-4 border-primary" : "",
                )}
              >
                <Link href={`/chat/${chat._id}`} prefetch={false}>
                  <span className="truncate">
                    {chat.name || "Untitled Chat"}
                  </span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-sidebar-accent"
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="w-40"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Actions
                  </DropdownMenuLabel>

                  <DropdownMenuItem
                    onClick={() => handleRenameOpen(chat._id, chat.name)}
                  >
                    <SquarePenIcon className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setChatToDelete(chat._id)}
                    className="text-white focus:text-white"
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
        {/* Loading Indicator / Sentinel */}
        <div ref={observerRef} className="py-2 flex justify-center h-8">
          {status === "LoadingMore" && (
            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </SidebarMenu>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!chatToDelete}
        onOpenChange={() => setChatToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => chatToDelete && handleDelete(chatToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog
        open={!!chatToRename}
        onOpenChange={(open) => !open && setChatToRename(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Chat name"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRenaming) {
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChatToRename(null)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={isRenaming || !newName.trim()}
            >
              {isRenaming ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
