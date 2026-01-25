"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function MobileHeader() {
  const isMobile = useIsMobile();

  return (
    <div className={cn(isMobile ? "block" : "hidden")}>
      <SidebarTrigger />
    </div>
  );
}
