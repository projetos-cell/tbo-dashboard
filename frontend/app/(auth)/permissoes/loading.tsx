import { Skeleton } from "@/components/ui/skeleton";

export default function PermissoesLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-10" />
          </div>
        ))}
      </div>

      {/* Role list + Permission matrix side by side */}
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        {/* Role list */}
        <div className="space-y-2 rounded-lg border p-4">
          <Skeleton className="h-5 w-20 mb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-md p-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>

        {/* Permission matrix */}
        <div className="rounded-lg border">
          <div className="border-b p-3">
            <div className="grid grid-cols-6 gap-3">
              <Skeleton className="h-4 w-20" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16 justify-self-center" />
              ))}
            </div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b p-3 last:border-0">
              <div className="grid grid-cols-6 gap-3 items-center">
                <Skeleton className="h-4 w-28" />
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-5 rounded justify-self-center" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
