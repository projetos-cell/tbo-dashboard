import type { Database } from "@/lib/supabase/types";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface ActivityRow {
  id: string;
  type: string;
  metadata: Record<string, unknown> | null;
  occurred_at: string | null;
  deal_id: string | null;
}

export interface StageVelocity {
  stage: DealStageKey;
  label: string;
  avgDays: number;
  dealCount: number;
  color: string;
}

export interface VelocitySummary {
  stages: StageVelocity[];
  avgCycleDays: number;
  salesVelocity: number; // (deals * ticket * winRate) / cycleDays
}

export interface AgingDeal {
  deal: DealRow;
  daysInStage: number;
  avgForStage: number;
  ratio: number; // daysInStage / avgForStage
}

export function computeStageVelocity(activities: ActivityRow[]): StageVelocity[] {
  const stageChanges = activities.filter((a) => a.type === "stage_change");
  const stageDurations = new Map<string, number[]>();

  for (const activity of stageChanges) {
    const meta = activity.metadata as Record<string, unknown> | null;
    if (!meta) continue;
    const fromStage = (meta.from_stage ?? meta.from_state) as string | undefined;
    const duration = meta.duration_days as number | undefined;

    if (fromStage && typeof duration === "number" && duration > 0) {
      const existing = stageDurations.get(fromStage) ?? [];
      existing.push(duration);
      stageDurations.set(fromStage, existing);
    }
  }

  const stages = Object.entries(DEAL_STAGES)
    .filter(([key]) => key !== "fechado_ganho" && key !== "fechado_perdido")
    .map(([key, config]) => {
      const durations = stageDurations.get(key) ?? [];
      const avgDays = durations.length > 0
        ? durations.reduce((s, d) => s + d, 0) / durations.length
        : 0;
      return {
        stage: key as DealStageKey,
        label: config.label,
        avgDays: Math.round(avgDays * 10) / 10,
        dealCount: durations.length,
        color: config.color,
      };
    });

  return stages;
}

export function computeVelocitySummary(
  deals: DealRow[],
  activities: ActivityRow[],
): VelocitySummary {
  const stages = computeStageVelocity(activities);
  const avgCycleDays = stages.reduce((s, st) => s + st.avgDays, 0) || 1;

  const won = deals.filter((d) => d.stage === "fechado_ganho");
  const closed = won.length + deals.filter((d) => d.stage === "fechado_perdido").length;
  const winRate = closed > 0 ? won.length / closed : 0;
  const avgTicket = won.length > 0 ? won.reduce((s, d) => s + (d.value ?? 0), 0) / won.length : 0;
  const activeCount = deals.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido",
  ).length;

  const salesVelocity = avgCycleDays > 0
    ? (activeCount * avgTicket * winRate) / avgCycleDays
    : 0;

  return { stages, avgCycleDays, salesVelocity: Math.round(salesVelocity) };
}

export function getAgingDeals(
  deals: DealRow[],
  stageVelocities: StageVelocity[],
  threshold = 2,
): AgingDeal[] {
  const avgMap = new Map(stageVelocities.map((s) => [s.stage, s.avgDays]));

  return deals
    .filter((d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido")
    .map((deal) => {
      const daysInStage = Math.floor(
        (Date.now() - new Date(deal.updated_at ?? deal.created_at ?? "").getTime()) / 86_400_000,
      );
      const avgForStage = avgMap.get(deal.stage as DealStageKey) ?? 7;
      return {
        deal,
        daysInStage,
        avgForStage: avgForStage || 7,
        ratio: avgForStage > 0 ? daysInStage / avgForStage : daysInStage / 7,
      };
    })
    .filter((a) => a.ratio >= threshold)
    .sort((a, b) => b.ratio - a.ratio);
}
