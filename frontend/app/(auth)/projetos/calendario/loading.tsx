import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjetosCalendarioLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[80px] rounded border p-1 space-y-1">
                <Skeleton className="h-4 w-6" />
                {i % 5 === 0 && <Skeleton className="h-5 w-full rounded" />}
                {i % 7 === 2 && <Skeleton className="h-5 w-full rounded" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
