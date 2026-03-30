import { Skeleton } from "@/components/ui/skeleton";

export default function DiagnosticoLoading() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}
