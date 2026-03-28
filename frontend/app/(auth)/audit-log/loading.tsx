import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-[280px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[320px]" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
