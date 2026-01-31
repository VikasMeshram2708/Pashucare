"use client";

import { cn } from "@/lib/utils";

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Center glow */}
      <div
        className="
          absolute left-1/2 top-1/2
          h-105 w-105
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          bg-linear-to-tr
          from-primary/40
          via-purple-500/30
          to-blue-500/30
          blur-3xl
          opacity-70
        "
      />

      {/* Top-right accent */}
      <div
        className="
          absolute right-[-10%] top-[-10%]
          h-80 w-[320px]
          rounded-full
          bg-linear-to-br
          from-indigo-500/30
          to-cyan-400/20
          blur-3xl
        "
      />

      {/* Bottom-left accent */}
      <div
        className="
          absolute left-[-10%] bottom-[-10%]
          h-75 w-75
          rounded-full
          bg-linear-to-tr
          from-fuchsia-500/30
          to-purple-600/20
          blur-3xl
        "
      />
    </div>
  );
}
