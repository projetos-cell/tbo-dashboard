import { Skeleton } from "@/components/ui/skeleton";

export default function ProjetosLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* KPIs skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      {/* Filter skeleton */}
      <Skeleton className="h-9 w-72" />

      {/* Board skeleton */}
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 min-w-[280px] space-y-2">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2 rounded-lg bg-muted/40 p-2 min-h-[200px]">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-32 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
