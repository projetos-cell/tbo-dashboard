import { Skeleton } from "@/components/ui/skeleton";

export default function ProjetosGanttLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-28" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="flex gap-0 border rounded-lg overflow-hidden">
        <div className="w-64 border-r flex-shrink-0 space-y-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-b px-3 py-2">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-0">
          <div className="border-b px-3 py-2 flex gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border-b px-3 py-2">
              <Skeleton
                className="h-5 rounded"
                style={{ width: `${30 + (i * 7) % 50}%`, marginLeft: `${(i * 11) % 30}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
