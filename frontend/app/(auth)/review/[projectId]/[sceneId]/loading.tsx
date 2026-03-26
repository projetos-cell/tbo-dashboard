import { Skeleton } from "@/components/ui/skeleton";

export default function SceneViewerLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Version timeline */}
      <div className="rounded-lg border bg-card px-4 py-3 mb-4 flex items-center gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            {i < 2 && <Skeleton className="w-6 h-px" />}
          </div>
        ))}
      </div>

      {/* Viewer + Sidebar */}
      <div className="flex flex-1 min-h-0 rounded-xl border overflow-hidden">
        <Skeleton className="flex-1" />
        <div className="w-80 border-l p-3 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
