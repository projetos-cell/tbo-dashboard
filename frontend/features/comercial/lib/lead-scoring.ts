import type { Database } from "@/lib/supabase/types";
import { SCORE_THRESHOLDS, type DealStageKey } from "@/lib/constants";

export type DealTemperature = "hot" | "warm" | "cold";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

const STAGE_FIT: Record<string, number> = {
  lead: 20,
  qualificacao: 40,
  proposta: 60,
  negociacao: 80,
  fechado_ganho: 100,
  fechado_perdido: 0,
};

function activityRecencyScore(updatedAt: string | null): number {
  if (!updatedAt) return 10;
  const daysSince = (Date.now() - new Date(updatedAt).getTime()) / 86_400_000;
  if (daysSince < 3) return 100;
  if (daysSince < 7) return 70;
  if (daysSince < 14) return 40;
  return 10;
}

export function computeLeadScore(deal: DealRow, maxPipelineValue: number): number {
  const valueNorm = maxPipelineValue > 0 ? ((deal.value ?? 0) / maxPipelineValue) * 100 : 0;
  const probability = deal.probability ?? 0;
  const recency = activityRecencyScore(deal.updated_at);
  const stageFit = STAGE_FIT[deal.stage] ?? 20;

  const score = (valueNorm * 0.25) + (probability * 0.25) + (recency * 0.25) + (stageFit * 0.25);
  return Math.round(Math.min(100, Math.max(0, score)));
}

export function classifyTemperature(score: number): DealTemperature {
  if (score >= SCORE_THRESHOLDS.hot) return "hot";
  if (score >= SCORE_THRESHOLDS.warm) return "warm";
  return "cold";
}

export interface ScoredDeal {
  deal: DealRow;
  score: number;
  temperature: DealTemperature;
}

export function scoreDeals(deals: DealRow[]): ScoredDeal[] {
  const activeDeals = deals.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido",
  );
  const maxValue = Math.max(...activeDeals.map((d) => d.value ?? 0), 1);

  return activeDeals.map((deal) => {
    const score = computeLeadScore(deal, maxValue);
    return { deal, score, temperature: classifyTemperature(score) };
  });
}

export const TEMPERATURE_CONFIG: Record<DealTemperature, { label: string; icon: string; color: string; bg: string }> = {
  hot: { label: "Quente", icon: "flame", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  warm: { label: "Morno", icon: "sun", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  cold: { label: "Frio", icon: "snowflake", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};
