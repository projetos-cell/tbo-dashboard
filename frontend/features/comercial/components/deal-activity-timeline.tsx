"use client";

import { IconClock, IconMessage } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  ACTIVITY_ICONS,
  ACTIVITY_LABELS,
  ACTIVITY_COLORS,
  type DealActivity,
} from "./deal-detail-helpers";

// ── Activity Timeline ───────────────────────────────────

interface DealActivityTimelineProps {
  dealId: string;
  rdDealId: string | null;
}

export function DealActivityTimeline({
  dealId,
  rdDealId,
}: DealActivityTimelineProps) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["deal-activities", dealId],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("crm_deal_activities" as never)
        .select("*")
        .eq("deal_id", dealId)
        .order("occurred_at", { ascending: false })
        .limit(50);

      // If no results by deal_id and we have rd_deal_id, try that
      if ((!data || (data as unknown[]).length === 0) && rdDealId) {
        const { data: rdData } = await supabase
          .from("crm_deal_activities" as never)
          .select("*")
          .eq("rd_deal_id", rdDealId)
          .order("occurred_at", { ascending: false })
          .limit(50);
        return (rdData ?? []) as unknown as DealActivity[];
      }

      if (error) return [];
      return (data ?? []) as unknown as DealActivity[];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!dealId,
  });

  return (
    <div>
      <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
        <IconClock className="h-3.5 w-3.5" strokeWidth={1.5} />
        Histórico
        <span className="ml-auto text-[10px] font-medium tabular-nums">
          {activities.length} {activities.length === 1 ? "registro" : "registros"}
        </span>
      </h4>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
          <IconClock className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma atividade registrada</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Atividades aparecerão aqui conforme o deal avançar</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] ?? IconMessage;
            const label = ACTIVITY_LABELS[activity.type] ?? activity.type;
            const colorClass = ACTIVITY_COLORS[activity.type] ?? "bg-gray-100 text-gray-600";

            return (
              <div
                key={activity.id}
                className="relative flex gap-3 py-2 pl-0"
              >
                {/* Icon dot */}
                <div className={`relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{label}</span>
                    {activity.author_name && (
                      <span className="text-xs text-muted-foreground truncate">
                        por {activity.author_name}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/70 shrink-0">
                      {new Date(activity.occurred_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </span>
                  </div>
                  {activity.title && (
                    <p className="text-sm text-foreground/80 truncate mt-0.5">
                      {activity.title}
                    </p>
                  )}
                  {activity.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {activity.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
