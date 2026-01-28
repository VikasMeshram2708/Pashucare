"use client";

import { renameChat } from "@/actions/quick-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit2Icon } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

export default function PlayRename({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  const [newName, setNewName] = useState("");
  // close button ref
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-2 py-1 flex items-center gap-2">
          <Edit2Icon className="size-4" />
          <span className="text-sm">Rename</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Rename chat</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-2"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            try {
              const res = await renameChat({
                chatId,
                name: newName,
              });
              if (!res.success) {
                toast.error(res.message ?? "Failed");
                return;
              }
              toast.success("Renamed");
            } catch (error) {
              console.error(error);
              toast.error("Something went wrong.");
            } finally {
              closeBtnRef.current?.click();
            }
          }}
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            type="text"
            placeholder={title ?? "Enter new name"}
          />
          <div className="flex items-center gap-2 justify-end">
            <Button type="submit">Save</Button>
            <DialogClose ref={closeBtnRef} asChild>
              <Button type="button" variant={"destructive"}>
                Close
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
