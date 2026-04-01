import { Skeleton } from "@/components/ui/skeleton";

export default function TarefasLoading() {
  return (
    <div className="flex flex-col gap-0">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-3 border-b">
        <Skeleton className="h-5 w-36" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-px pt-4">
        <Skeleton className="h-7 w-40 mb-3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
        <Skeleton className="h-7 w-40 mt-4 mb-3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
