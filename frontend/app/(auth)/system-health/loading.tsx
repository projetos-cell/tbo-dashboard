import { Skeleton } from "@/components/ui/skeleton";

export default function SystemHealthLoading() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>

      {/* Service cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Sync metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Error table */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <div className="rounded-lg border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b p-3 last:border-0">
              <div className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 shrink-0 rounded mt-0.5" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-20 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
