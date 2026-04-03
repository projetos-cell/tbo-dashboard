"use client";

import { IconAlertTriangle, IconClock, IconCalendarEvent } from "@tabler/icons-react";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";
import type { AttentionDeal, AttentionReason } from "@/features/comercial/lib/follow-up";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

const REASON_ICONS: Record<AttentionReason, React.ElementType> = {
  stale: IconClock,
  overdue_action: IconAlertTriangle,
  closing_soon: IconCalendarEvent,
};

const REASON_LABELS: Record<AttentionReason, string> = {
  stale: "Sem atividade",
  overdue_action: "Acao vencida",
  closing_soon: "Fechamento proximo",
};

const REASON_COLORS: Record<AttentionReason, string> = {
  stale: "#f59e0b",
  overdue_action: "#ef4444",
  closing_soon: "#8b5cf6",
};

interface AttentionWidgetProps {
  items: AttentionDeal[];
  onDealClick: (deal: DealRow) => void;
  maxItems?: number;
}

export function AttentionWidget({ items, onDealClick, maxItems = 5 }: AttentionWidgetProps) {
  const visible = items.slice(0, maxItems);

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 text-center">
        <p className="text-sm font-medium text-green-700">Tudo em dia</p>
        <p className="text-xs text-green-600 mt-0.5">Nenhum deal precisa de atencao imediata.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map(({ deal, reasons, daysSinceActivity }) => {
        const stage = DEAL_STAGES[deal.stage as DealStageKey];
        const topReason = reasons[0];
        const TopIcon = REASON_ICONS[topReason];
        const topColor = REASON_COLORS[topReason];

        return (
          <button
            key={deal.id}
            className="w-full text-left rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm transition-all group"
            onClick={() => onDealClick(deal)}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="rounded-md p-1.5 shrink-0 mt-0.5"
                style={{ backgroundColor: `${topColor}15` }}
              >
                <TopIcon className="h-3.5 w-3.5" style={{ color: topColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{deal.name}</p>
                  {deal.value != null && deal.value > 0 && (
                    <span className="text-xs font-semibold text-gray-600 tabular-nums shrink-0">
                      {formatCurrency(deal.value)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {deal.company && (
                    <span className="text-[11px] text-gray-500 truncate">{deal.company}</span>
                  )}
                  <span className="text-[11px] text-gray-400">{daysSinceActivity}d sem atividade</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {reasons.map((reason) => (
                    <span
                      key={reason}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${REASON_COLORS[reason]}12`,
                        color: REASON_COLORS[reason],
                      }}
                    >
                      {REASON_LABELS[reason]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {items.length > maxItems && (
        <p className="text-center text-xs text-gray-500">
          +{items.length - maxItems} deals precisam de atencao
        </p>
      )}
    </div>
  );
}
