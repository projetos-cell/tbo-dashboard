import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

// ── KPIs ─────────────────────────────────────────────────────────────────────

export interface CommercialKPIs {
  totalBilled: number;
  totalQuoted: number;
  conversionRate: number;
  avgTicket: number;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  activeDeals: number;
}

export function computeCommercialKPIs(deals: DealRow[]): CommercialKPIs {
  const won = deals.filter((d) => d.stage === "fechado_ganho");
  const lost = deals.filter((d) => d.stage === "fechado_perdido");
  const closed = won.length + lost.length;
  const active = deals.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido",
  );

  const totalBilled = won.reduce((s, d) => s + (d.value ?? 0), 0);
  const totalQuoted = deals.reduce((s, d) => s + (d.value ?? 0), 0);
  const conversionRate = closed > 0 ? (won.length / closed) * 100 : 0;
  const avgTicket = won.length > 0 ? totalBilled / won.length : 0;

  return {
    totalBilled,
    totalQuoted,
    conversionRate,
    avgTicket,
    totalDeals: deals.length,
    wonDeals: won.length,
    lostDeals: lost.length,
    activeDeals: active.length,
  };
}

// ── Monthly Revenue ──────────────────────────────────────────────────────────

export interface MonthlyData {
  month: string; // "Jan/25"
  billed: number;
  quoted: number;
}

export function computeMonthlyRevenue(deals: DealRow[]): MonthlyData[] {
  const months = new Map<string, { billed: number; quoted: number }>();

  for (const d of deals) {
    const date = d.created_at ? new Date(d.created_at) : null;
    if (!date) continue;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = months.get(key) ?? { billed: 0, quoted: 0 };

    existing.quoted += d.value ?? 0;
    if (d.stage === "fechado_ganho") {
      existing.billed += d.value ?? 0;
    }

    months.set(key, existing);
  }

  const MONTH_NAMES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];

  return Array.from(months.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [year, month] = key.split("-");
      return {
        month: `${MONTH_NAMES[parseInt(month) - 1]}/${year.slice(2)}`,
        billed: v.billed,
        quoted: v.quoted,
      };
    });
}

// ── Top Clients ──────────────────────────────────────────────────────────────

export interface ClientData {
  name: string;
  proposals: number;
  converted: number;
  conversionRate: number;
  quoted: number;
  billed: number;
  participation: number;
}

export function computeTopClients(deals: DealRow[]): ClientData[] {
  const clients = new Map<
    string,
    { proposals: number; converted: number; quoted: number; billed: number }
  >();

  for (const d of deals) {
    const name = d.company || d.contact || "Sem empresa";
    const existing = clients.get(name) ?? {
      proposals: 0,
      converted: 0,
      quoted: 0,
      billed: 0,
    };

    existing.proposals++;
    existing.quoted += d.value ?? 0;

    if (d.stage === "fechado_ganho") {
      existing.converted++;
      existing.billed += d.value ?? 0;
    }

    clients.set(name, existing);
  }

  const totalBilled = Array.from(clients.values()).reduce(
    (s, c) => s + c.billed,
    0,
  );

  return Array.from(clients.entries())
    .map(([name, v]) => ({
      name,
      proposals: v.proposals,
      converted: v.converted,
      conversionRate:
        v.proposals > 0 ? (v.converted / v.proposals) * 100 : 0,
      quoted: v.quoted,
      billed: v.billed,
      participation: totalBilled > 0 ? (v.billed / totalBilled) * 100 : 0,
    }))
    .sort((a, b) => b.billed - a.billed);
}

// ── Top Owners / Vendedores ──────────────────────────────────────────────────

export interface OwnerData {
  name: string;
  deals: number;
  won: number;
  billed: number;
  conversionRate: number;
}

export function computeTopOwners(deals: DealRow[]): OwnerData[] {
  const owners = new Map<
    string,
    { deals: number; won: number; billed: number; closed: number }
  >();

  for (const d of deals) {
    const name = d.owner_name || "Sem responsável";
    const existing = owners.get(name) ?? {
      deals: 0,
      won: 0,
      billed: 0,
      closed: 0,
    };

    existing.deals++;
    if (d.stage === "fechado_ganho") {
      existing.won++;
      existing.billed += d.value ?? 0;
      existing.closed++;
    } else if (d.stage === "fechado_perdido") {
      existing.closed++;
    }

    owners.set(name, existing);
  }

  return Array.from(owners.entries())
    .map(([name, v]) => ({
      name,
      deals: v.deals,
      won: v.won,
      billed: v.billed,
      conversionRate: v.closed > 0 ? (v.won / v.closed) * 100 : 0,
    }))
    .sort((a, b) => b.billed - a.billed);
}

// ── Stage Distribution ───────────────────────────────────────────────────────

export interface StageDistribution {
  stage: string;
  label: string;
  count: number;
  value: number;
  color: string;
}

const STAGE_COLORS: Record<string, string> = {
  lead: "#6366f1",
  qualificacao: "#f59e0b",
  proposta: "#3b82f6",
  negociacao: "#8b5cf6",
  fechado_ganho: "#22c55e",
  fechado_perdido: "#ef4444",
};

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  qualificacao: "Qualificação",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado_ganho: "Ganho",
  fechado_perdido: "Perdido",
};

export function computeStageDistribution(
  deals: DealRow[],
): StageDistribution[] {
  const stages = new Map<string, { count: number; value: number }>();

  for (const d of deals) {
    const existing = stages.get(d.stage) ?? { count: 0, value: 0 };
    existing.count++;
    existing.value += d.value ?? 0;
    stages.set(d.stage, existing);
  }

  return Array.from(stages.entries())
    .map(([stage, v]) => ({
      stage,
      label: STAGE_LABELS[stage] ?? stage,
      count: v.count,
      value: v.value,
      color: STAGE_COLORS[stage] ?? "#6b7280",
    }))
    .sort(
      (a, b) =>
        (Object.keys(STAGE_LABELS).indexOf(a.stage) ?? 99) -
        (Object.keys(STAGE_LABELS).indexOf(b.stage) ?? 99),
    );
}

// ── Pipeline by Owner ────────────────────────────────────────────────────────

export interface PipelineByOwner {
  owner: string;
  pipeline: string;
  deals: number;
  won: number;
  billed: number;
}

export function computePipelineByOwner(deals: DealRow[]): PipelineByOwner[] {
  const map = new Map<string, { pipeline: string; deals: number; won: number; billed: number }>();

  for (const d of deals) {
    const owner = d.owner_name || "Sem responsável";
    const pipeline = (d as unknown as Record<string, unknown>).rd_pipeline_name as string || "Padrão";
    const key = `${owner}|${pipeline}`;
    const existing = map.get(key) ?? { pipeline, deals: 0, won: 0, billed: 0 };

    existing.deals++;
    if (d.stage === "fechado_ganho") {
      existing.won++;
      existing.billed += d.value ?? 0;
    }

    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([key, v]) => ({
      owner: key.split("|")[0],
      pipeline: v.pipeline,
      deals: v.deals,
      won: v.won,
      billed: v.billed,
    }))
    .sort((a, b) => b.billed - a.billed);
}
