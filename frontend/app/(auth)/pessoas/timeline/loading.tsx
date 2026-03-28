import { Skeleton } from "@/components/ui/skeleton";

export default function PessoasTimelineLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="flex flex-col items-center gap-1 pt-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-16 w-0.5" />
            </div>
            <div className="flex-1 space-y-1.5 pb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
