import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarioRhLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-64" />
          </div>
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>

      {/* Body */}
      <div className="flex gap-6">
        {/* Calendar grid */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <div className="flex gap-1">
              <Skeleton className="size-8" />
              <Skeleton className="h-8 w-14" />
              <Skeleton className="size-8" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={`h-${i}`} className="h-8" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={`d-${i}`} className="h-24" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 space-y-3 rounded-lg border p-4">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
