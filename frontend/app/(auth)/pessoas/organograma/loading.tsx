import { Skeleton } from "@/components/ui/skeleton";

export default function OrganogramaLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex flex-col items-center gap-6 pt-4">
        <Skeleton className="h-16 w-48 rounded-lg" />
        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <Skeleton className="h-14 w-40 rounded-lg" />
              <div className="flex gap-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-36 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
