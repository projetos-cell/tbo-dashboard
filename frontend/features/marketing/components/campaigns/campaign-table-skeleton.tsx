"use client";

// Feature #71 — Skeleton content-aware para tabela de campanhas
// Reflete o layout real: star | nome + desc | badge status | período | budget bar | canais | ações

import { Skeleton } from "@/components/ui/skeleton";

function CampaignRowSkeleton() {
  return (
    <tr>
      {/* star */}
      <td className="px-2 py-3">
        <Skeleton className="h-6 w-6 rounded" />
      </td>
      {/* nome + descrição */}
      <td className="px-4 py-3 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64 opacity-60" />
      </td>
      {/* status badge */}
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      {/* período — hidden on small */}
      <td className="hidden px-4 py-3 md:table-cell">
        <Skeleton className="h-4 w-32" />
      </td>
      {/* budget bar — hidden on small */}
      <td className="hidden px-4 py-3 lg:table-cell">
        <div className="w-28 space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-2.5 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </td>
      {/* canais badges — hidden on small */}
      <td className="hidden px-4 py-3 lg:table-cell">
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </td>
      {/* ações */}
      <td className="px-4 py-3">
        <div className="flex gap-0.5">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </td>
    </tr>
  );
}

/** Skeleton da tabela inteira de campanhas com KPIs no topo */
export function CampaignTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-48 rounded-md" />
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-14" />
              </th>
              <th className="hidden px-4 py-3 text-left md:table-cell">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="hidden px-4 py-3 text-left lg:table-cell">
                <Skeleton className="h-3 w-14" />
              </th>
              <th className="hidden px-4 py-3 text-left lg:table-cell">
                <Skeleton className="h-3 w-12" />
              </th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.from({ length: rows }).map((_, i) => (
              <CampaignRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Skeleton para grid de cards (email templates, assets, contas sociais) */
export function CardGridSkeleton({ count = 6, cols = 3 }: { count?: number; cols?: 2 | 3 | 4 }) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[cols];

  return (
    <div className={`grid ${colClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md ml-2 shrink-0" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton para listagem simples (linha única: título + badge + data + ações) */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border divide-y overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5 opacity-60" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
