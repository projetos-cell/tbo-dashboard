import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjetosFluxo3DLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 min-w-[200px] space-y-2">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-6" />
            </div>
            <div className="space-y-2 rounded-lg border p-2 min-h-[400px]">
              {Array.from({ length: 2 + (i % 3) }).map((_, j) => (
                <Card key={j}>
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-24 w-full rounded" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
