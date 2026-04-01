import { Skeleton } from "@/components/ui/skeleton";

export default function ServicosLoading() {
  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4 bg-hub-bg/50 backdrop-blur-lg border-r border-glass-border">
          {[120, 180, 100].map((h, i) => (
            <Skeleton key={i} className="rounded-2xl" style={{ height: h }} />
          ))}
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </main>
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4 bg-hub-bg/50 backdrop-blur-lg border-l border-glass-border">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}
