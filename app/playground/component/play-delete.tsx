"use client";

import { deleteChat } from "@/actions/quick-actions";
import { Trash2Icon } from "lucide-react";

import { toast } from "sonner";

export default function PlayDelete({ chatId }: { chatId: string }) {
  async function handleDelete() {
    try {
      const res = await deleteChat({ chatId });
      if (!res.success) {
        toast.error(res.message ?? "Failed");
        return;
      }
      toast.success(res.message ?? "Deleted");
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
