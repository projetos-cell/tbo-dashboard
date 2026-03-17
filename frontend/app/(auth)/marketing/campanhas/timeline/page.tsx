"use client";

// Feature #12 — Timeline visual de campanhas (Gantt simplificado: nome + barra de datas)

import { useMemo } from "react";
import { IconCalendar, IconSpeakerphone } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useMarketingCampaigns } from "@/features/marketing/hooks/use-marketing-campaigns";
import { MARKETING_CAMPAIGN_STATUS } from "@/lib/constants";
import type { MarketingCampaign, MarketingCampaignStatus } from "@/features/marketing/types/marketing";

function getDateRange(campaigns: MarketingCampaign[]): { min: Date; max: Date } {
  const withDates = campaigns.filter((c) => c.start_date || c.end_date);
  if (withDates.length === 0) {
    const now = new Date();
    return { min: now, max: new Date(now.getTime() + 90 * 24 * 3600 * 1000) };
  }
  const dates = withDates.flatMap((c) => [
    c.start_date ? new Date(c.start_date) : null,
    c.end_date ? new Date(c.end_date) : null,
  ]).filter(Boolean) as Date[];
  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));
  // Ensure at least 30 days of range
  if (max.getTime() - min.getTime() < 30 * 24 * 3600 * 1000) {
    max.setDate(max.getDate() + 30);
  }
  return { min, max };
}

function GanttRow({ campaign, min, totalDays }: {
  campaign: MarketingCampaign;
  min: Date;
  totalDays: number;
}) {
  const statusDef = MARKETING_CAMPAIGN_STATUS[campaign.status as MarketingCampaignStatus];

  const start = campaign.start_date ? new Date(campaign.start_date) : null;
  const end = campaign.end_date ? new Date(campaign.end_date) : null;

  const leftPct = start
    ? Math.max(0, (start.getTime() - min.getTime()) / (totalDays * 24 * 3600 * 1000)) * 100
    : 0;
  const widthPct = start && end
    ? Math.max(
        1,
        ((end.getTime() - start.getTime()) / (totalDays * 24 * 3600 * 1000)) * 100,
      )
    : start
    ? 8
    : 100;

  const barColor = statusDef?.bg ?? "#e2e8f0";
  const textColor = statusDef?.color ?? "#64748b";

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0 group hover:bg-muted/20 transition-colors px-4">
      {/* Campaign name + badge — fixed width */}
      <div className="w-48 shrink-0 space-y-0.5">
        <p className="text-sm font-medium truncate">{campaign.name}</p>
        {statusDef && (
          <Badge
            variant="secondary"
            className="text-[10px] h-4 px-1.5"
            style={{ backgroundColor: barColor, color: textColor }}
          >
            {statusDef.label}
          </Badge>
        )}
      </div>

      {/* Gantt bar */}
      <div className="relative flex-1 h-8 rounded-sm bg-muted overflow-hidden">
        {(start ?? end) ? (
          <div
            className="absolute top-1 bottom-1 rounded flex items-center px-2 overflow-hidden transition-all"
            style={{
              left: `${leftPct}%`,
              width: `${Math.min(widthPct, 100 - leftPct)}%`,
              backgroundColor: barColor,
            }}
          >
            <span
              className="text-[10px] font-medium truncate whitespace-nowrap"
              style={{ color: textColor }}
            >
              {start ? fmtDate(start) : ""}
              {start && end ? " → " : ""}
              {end ? fmtDate(end) : ""}
            </span>
          </div>
        ) : (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center px-2">
            <span className="text-[10px] text-muted-foreground">sem datas definidas</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MonthHeaders({ min, totalDays }: { min: Date; totalDays: number }) {
  const months: Array<{ label: string; leftPct: number; widthPct: number }> = [];
  const current = new Date(min.getFullYear(), min.getMonth(), 1);
  const end = new Date(min.getTime() + totalDays * 24 * 3600 * 1000);

  while (current <= end) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const leftPct = Math.max(
      0,
      ((monthStart.getTime() - min.getTime()) / (totalDays * 24 * 3600 * 1000)) * 100,
    );
    const rightEdge = Math.min(
      100,
      ((monthEnd.getTime() - min.getTime()) / (totalDays * 24 * 3600 * 1000)) * 100,
    );
    months.push({
      label: current.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      leftPct,
      widthPct: rightEdge - leftPct,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return (
    <div className="relative flex-1 h-6 ml-52">
      {months.map((m, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 flex items-center justify-start pl-1 border-l border-border/50"
          style={{ left: `${m.leftPct}%`, width: `${m.widthPct}%` }}
        >
          <span className="text-[10px] text-muted-foreground capitalize">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

function TimelineContent() {
  const { data: campaigns, isLoading, error, refetch } = useMarketingCampaigns();

  const { min, totalDays } = useMemo(() => {
    const range = getDateRange(campaigns ?? []);
    return {
      min: range.min,
      totalDays: Math.ceil(
        (range.max.getTime() - range.min.getTime()) / (24 * 3600 * 1000),
      ),
    };
  }, [campaigns]);

  // Sort by start_date
  const sorted = useMemo(
    () =>
      [...(campaigns ?? [])].sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      }),
    [campaigns],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timeline de Campanhas</h1>
        <p className="text-sm text-muted-foreground">
          Visão temporal de todas as campanhas com período de execução.
        </p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar campanhas." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2 rounded-lg border p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-8 w-48 shrink-0" />
              <Skeleton className="h-8 flex-1" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={IconCalendar}
          title="Nenhuma campanha na timeline"
          description="Crie campanhas com datas de início e fim para visualizá-las na timeline."
          cta={{ label: "Ver campanhas", onClick: () => window.history.back() }}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {/* Month header row */}
          <div className="flex items-center bg-muted/40 px-4 py-1.5 border-b">
            <div className="w-48 shrink-0">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <IconSpeakerphone size={12} />
                Campanha
              </div>
            </div>
            <MonthHeaders min={min} totalDays={totalDays} />
          </div>

          {/* Rows */}
          {sorted.map((campaign) => (
            <GanttRow
              key={campaign.id}
              campaign={campaign}
              min={min}
              totalDays={totalDays}
            />
          ))}

          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "campanha" : "campanhas"} · período de {totalDays} dias
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimelinePage() {
  return (
    <RequireRole module="marketing">
      <TimelineContent />
    </RequireRole>
  );
}
