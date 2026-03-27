"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {/* UX04 — Content-aware skeleton: toolbar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      {/* UX04 — Content-aware skeleton: table header */}
      <div className="overflow-hidden rounded-lg border border-border/60">
        <div className="flex items-center gap-0 border-b border-border/60 bg-muted/40 px-3 py-2">
          <div className="w-[28px]" />
          <Skeleton className="mx-2 h-3 w-8" />
          <div className="flex-1 px-2"><Skeleton className="h-3 w-16" /></div>
          <Skeleton className="mx-2 h-3 w-14 hidden md:block" />
          <Skeleton className="mx-2 h-3 w-16 hidden md:block" />
          <Skeleton className="mx-2 h-3 w-20 hidden md:block" />
          <Skeleton className="mx-2 h-3 w-14 hidden md:block" />
        </div>
        {/* UX04 — Content-aware skeleton: task rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-0 border-b border-border/30 px-3 py-2.5 last:border-b-0"
          >
            <div className="w-[28px]" />
            <Skeleton className="mx-2 size-4 rounded-full" />
            <div className="flex-1 px-2">
              <Skeleton className="h-4 rounded" style={{ width: `${55 + (i % 3) * 15}%` }} />
            </div>
            <Skeleton className="mx-2 h-5 w-16 rounded-full hidden md:block" />
            <Skeleton className="mx-2 h-5 w-14 rounded-full hidden md:block" />
            <div className="mx-2 hidden items-center gap-1.5 md:flex">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="mx-2 h-3 w-20 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
