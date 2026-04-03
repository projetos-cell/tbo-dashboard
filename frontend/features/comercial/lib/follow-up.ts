import type { Database } from "@/lib/supabase/types";
import { STAGE_CADENCE, type DealStageKey } from "@/lib/constants";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

export type AttentionReason = "stale" | "overdue_action" | "closing_soon";

export interface AttentionDeal {
  deal: DealRow;
  reasons: AttentionReason[];
  urgency: number; // higher = more urgent
  daysSinceActivity: number;
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 999;
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

export function isStale(deal: DealRow): boolean {
  const cadence = STAGE_CADENCE[deal.stage as DealStageKey] ?? 7;
  return daysSince(deal.updated_at) > cadence;
}

export function hasOverdueAction(deal: DealRow): boolean {
  if (!deal.next_action_date) return false;
  return daysUntil(deal.next_action_date) < 0;
}

export function isClosingSoon(deal: DealRow, withinDays = 7): boolean {
  if (!deal.expected_close) return false;
  const days = daysUntil(deal.expected_close);
  return days >= 0 && days <= withinDays;
}

export function getDealsNeedingAttention(deals: DealRow[]): AttentionDeal[] {
  const active = deals.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido",
  );

  const results: AttentionDeal[] = [];

  for (const deal of active) {
    const reasons: AttentionReason[] = [];
    let urgency = 0;

    if (isStale(deal)) {
      reasons.push("stale");
      const cadence = STAGE_CADENCE[deal.stage as DealStageKey] ?? 7;
      const excess = daysSince(deal.updated_at) - cadence;
      urgency += Math.min(excess * 10, 50);
    }

    if (hasOverdueAction(deal)) {
      reasons.push("overdue_action");
      urgency += 30 + Math.min(Math.abs(daysUntil(deal.next_action_date!)) * 5, 30);
    }

    if (isClosingSoon(deal)) {
      reasons.push("closing_soon");
      const remaining = daysUntil(deal.expected_close!);
      urgency += remaining <= 2 ? 40 : 20;
    }

    if (reasons.length > 0) {
      results.push({
        deal,
        reasons,
        urgency,
        daysSinceActivity: daysSince(deal.updated_at),
      });
    }
  }

  return results.sort((a, b) => b.urgency - a.urgency);
}

export const ATTENTION_LABELS: Record<AttentionReason, { label: string; color: string }> = {
  stale: { label: "Sem atividade", color: "#f59e0b" },
  overdue_action: { label: "Acao vencida", color: "#ef4444" },
  closing_soon: { label: "Fechamento proximo", color: "#8b5cf6" },
};

export function getStaleDealsBadgeCount(deals: DealRow[]): number {
  return deals.filter(
    (d) =>
      d.stage !== "fechado_ganho" &&
      d.stage !== "fechado_perdido" &&
      (isStale(d) || hasOverdueAction(d)),
  ).length;
}
