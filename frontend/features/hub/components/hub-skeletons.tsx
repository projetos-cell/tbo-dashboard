"use client";

import { Skeleton } from "@/components/ui/skeleton";

/* ─── Glass Shell ──────────────────────────────────────────────── */

function GlassShell({
  children,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-2xl backdrop-blur-[16px] backdrop-saturate-[180%] shadow-[0_8px_32px_rgba(15,15,15,0.06),0_1px_3px_rgba(15,15,15,0.04)] ${
        dark
          ? "bg-foreground/75 border border-white/[0.08]"
          : "bg-glass border border-glass-border"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Categories Skeleton ────────────────────────────────────────── */

export function CategoriesSkeleton() {
  return (
    <GlassShell>
      <Skeleton className="h-4 w-24 mb-3" />
      <div className="space-y-1">
        {[72, 83, 68, 90, 76, 61, 85].map((w, i) => (
          <Skeleton
            key={i}
            className="h-8 rounded-lg"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </GlassShell>
  );
}

/* ─── Calendar Skeleton ──────────────────────────────────────────── */

export function CalendarSkeleton() {
  return (
    <GlassShell>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="grid grid-cols-6 gap-1 mb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 mx-auto w-6" />
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1 mb-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex justify-center py-1">
            <Skeleton className="size-7 rounded-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-2 border-t border-border/30">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </GlassShell>
  );
}

/* ─── Social/Birthday Skeleton ───────────────────────────────────── */

export function SocialCardSkeleton() {
  return (
    <div className="p-5 text-center rounded-2xl bg-hub-orange/15">
      <Skeleton className="h-3 w-20 mx-auto mb-3 bg-orange-200/30" />
      <Skeleton className="size-14 rounded-full mx-auto mb-2 bg-orange-200/30" />
      <Skeleton className="h-4 w-28 mx-auto mb-1 bg-orange-200/30" />
      <Skeleton className="h-3 w-20 mx-auto mb-3 bg-orange-200/30" />
      <Skeleton className="h-8 w-36 mx-auto rounded-full bg-orange-200/30" />
    </div>
  );
}

/* ─── Post Composer Skeleton ─────────────────────────────────────── */

export function PostComposerSkeleton() {
  return (
    <GlassShell className="flex items-center gap-3">
      <Skeleton className="size-9 rounded-full shrink-0" />
      <Skeleton className="flex-1 h-10 rounded-full" />
      <Skeleton className="size-9 rounded-xl shrink-0" />
    </GlassShell>
  );
}

/* ─── Feed Post Skeleton ─────────────────────────────────────────── */

export function FeedPostSkeleton() {
  return (
    <GlassShell className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="mx-4">
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div className="px-5 py-4">
        <Skeleton className="h-5 w-4/5 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-full" />
            <div>
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </GlassShell>
  );
}

/* ─── Projects Skeleton ──────────────────────────────────────────── */

export function ProjectsSkeleton() {
  return (
    <GlassShell>
      <Skeleton className="h-4 w-20 mb-3" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <Skeleton className="h-3.5 w-3/4 mb-1.5" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-3 w-10 mt-1" />
          </div>
        ))}
      </div>
    </GlassShell>
  );
}

/* ─── Documents Skeleton ─────────────────────────────────────────── */

export function DocumentsSkeleton() {
  return (
    <GlassShell>
      <Skeleton className="h-4 w-24 mb-3" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </GlassShell>
  );
}
