"use client";

import { deleteChat } from "@/actions/quick-actions";
import { Trash2Icon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { toast } from "sonner";

export default function PlayDelete({ chatId }: { chatId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleDelete() {
    try {
      const res = await deleteChat({ chatId });
      if (!res.success) {
        toast.error(res.message ?? "Failed");
        return;
      }
      toast.success(res.message ?? "Deleted");

      // Check if the deleted chat is currently being viewed
      const isCurrentChat = pathname.includes(`/ai/chat/${chatId}`);

      // Dispatch custom event to notify sidebar to refresh
      window.dispatchEvent(
        new CustomEvent("chatDeleted", { detail: { chatId } }),
      );

      // If the deleted chat is currently being viewed, redirect to chat list
      if (isCurrentChat) {
        router.push("/ai/chat");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }
  return (
    <button
      className="flex items-center gap-2"
      type="button"
      onClick={handleDelete}
    >
      <Trash2Icon />
      Delete
    </button>
  );
}
