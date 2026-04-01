"use client";

import { cn } from "@/lib/utils";

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-glass border border-glass-border backdrop-blur-[16px] backdrop-saturate-[180%]",
        "shadow-[0_8px_32px_rgba(15,15,15,0.06),0_1px_3px_rgba(15,15,15,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
