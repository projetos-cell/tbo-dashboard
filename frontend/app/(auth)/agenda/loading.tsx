import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Calendar controls */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b bg-muted/40 p-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="mx-auto h-4 w-8" />
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-24 border-b border-r p-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              {i % 5 === 0 && <Skeleton className="mt-1 h-3 w-16" />}
              {i % 7 === 2 && <Skeleton className="mt-1 h-3 w-20" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
