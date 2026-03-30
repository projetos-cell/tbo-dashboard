import { Skeleton } from "@/components/ui/skeleton";

export default function KanbanLoading() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Toolbar */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Kanban board — 5 columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, col) => (
          <div key={col} className="flex w-64 shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            {Array.from({ length: col === 2 ? 4 : col === 0 ? 3 : 2 }).map((_, card) => (
              <div key={card} className="space-y-2 rounded-lg border bg-card p-3">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
