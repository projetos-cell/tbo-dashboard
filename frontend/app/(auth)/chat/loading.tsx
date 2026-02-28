import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex h-[calc(100vh-8rem)] rounded-lg border overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="w-60 shrink-0 border-r p-3 space-y-2">
          <Skeleton className="h-4 w-16 mb-3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </div>

        {/* Main area skeleton */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-48 mt-3" />
        </div>
      </div>
    </div>
  );
}
