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
import { EllipsisVerticalIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ChatsList() {
  return (
    <section>
      <SidebarMenu className="h-screen overflow-y-auto">
        {Array.from({ length: 100 }).map((_, idx) => (
          <SidebarMenuItem key={idx}>
            {/* MAIN ROW BUTTON */}
            <SidebarMenuButton asChild>
              <Link href={`/chat/${idx + 1}`}>
                <span className="truncate">{idx + 1} Lorem, ipsum.</span>
              </Link>
            </SidebarMenuButton>

            {/* ACTION BUTTON (ITSELF IS THE TRIGGER) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction>
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </SidebarMenuAction>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-muted-foreground">
                  Actions
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onSelect={() => toast.warning("Coming soon!")}
                >
                  <SquarePenIcon className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => toast.error("Coming soon!")}>
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </section>
  );
}
