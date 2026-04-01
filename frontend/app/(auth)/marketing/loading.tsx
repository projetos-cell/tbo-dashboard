import { Skeleton } from "@/components/ui/skeleton";

const T = { glassBorder: "rgba(255,255,255,0.45)" };

export default function MarketingLoading() {
  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
          <Skeleton className="h-44 rounded-2xl" />
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </main>
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
          <Skeleton className="h-44 rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}
