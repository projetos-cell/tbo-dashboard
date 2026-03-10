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

// ── BU Classification ───────────────────────────────────────────────────────

const BU_KEYWORDS: Record<string, string[]> = {
  "Render 3D": [
    "imagens estáticas", "imagem estática", "render", "modelagem 3d",
    "plantas humanizadas", "implantações humanizadas", "implantação humanizada",
    "imagens 360", "imagem 360", "perspectiva", "maquete eletrônica",
    "maquete 3d", "tour virtual", "still",
  ],
  Audiovisual: [
    "animação", "animacao", "teaser", "filme", "vídeo", "video",
    "motion", "lançamento", "audiovisual",
  ],
  Marketing: [
    "plano de marketing", "gestão campanha", "gestao campanha",
    "campanha online", "mídia", "midia", "tráfego", "trafego",
    "social media", "marketing digital", "inbound",
  ],
  Branding: [
    "identidade visual", "brand", "logo", "naming", "comunicação visual",
    "comunicacao visual", "landing page", "manual de marca",
  ],
  Interiores: [
    "interiores", "interior", "decoração", "decoracao", "proj. conceitual",
    "projeto conceitual",
  ],
  Arquitetura: [
    "proj. arquitetônico", "projeto arquitetônico", "proj. arquitetonico",
    "projeto arquitetonico", "arquitetura",
  ],
  Lumion: ["lumion"],
};

function classifyBU(dealName: string): string {
  const lower = dealName.toLowerCase();
  for (const [bu, keywords] of Object.entries(BU_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return bu;
  }
  return "Outros";
}

// ── Product Mix ─────────────────────────────────────────────────────────────

export interface ProductData {
  name: string;
  bu: string;
  qtdSold: number;
  avgUnitPrice: number;
  totalRevenue: number;
  pctOfTotal: number;
}

export function computeProductMix(deals: DealRow[]): ProductData[] {
  const won = deals.filter((d) => d.stage === "fechado_ganho");
  const products = new Map<string, { bu: string; count: number; revenue: number }>();

  for (const d of won) {
    const name = d.name || "Sem nome";
    const existing = products.get(name) ?? {
      bu: classifyBU(name),
      count: 0,
      revenue: 0,
    };
    existing.count++;
    existing.revenue += d.value ?? 0;
    products.set(name, existing);
  }

  const totalRevenue = Array.from(products.values()).reduce(
    (s, p) => s + p.revenue,
    0,
  );

  return Array.from(products.entries())
    .map(([name, v]) => ({
      name,
      bu: v.bu,
      qtdSold: v.count,
      avgUnitPrice: v.count > 0 ? v.revenue / v.count : 0,
      totalRevenue: v.revenue,
      pctOfTotal: totalRevenue > 0 ? (v.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// ── BU Distribution ─────────────────────────────────────────────────────────

export interface BUDistribution {
  bu: string;
  revenue: number;
  count: number;
  pct: number;
  color: string;
}

const BU_COLORS_MAP: Record<string, string> = {
  "Render 3D": "#a78bfa",
  Audiovisual: "#f472b6",
  Marketing: "#34d399",
  Branding: "#60a5fa",
  Interiores: "#818cf8",
  Arquitetura: "#fbbf24",
  Lumion: "#a3e635",
  Outros: "#94a3b8",
};

export function computeBUDistribution(deals: DealRow[]): BUDistribution[] {
  const won = deals.filter((d) => d.stage === "fechado_ganho");
  const bus = new Map<string, { revenue: number; count: number }>();

  for (const d of won) {
    const bu = classifyBU(d.name || "");
    const existing = bus.get(bu) ?? { revenue: 0, count: 0 };
    existing.revenue += d.value ?? 0;
    existing.count++;
    bus.set(bu, existing);
  }

  const totalRevenue = Array.from(bus.values()).reduce(
    (s, b) => s + b.revenue,
    0,
  );

  return Array.from(bus.entries())
    .map(([bu, v]) => ({
      bu,
      revenue: v.revenue,
      count: v.count,
      pct: totalRevenue > 0 ? (v.revenue / totalRevenue) * 100 : 0,
      color: BU_COLORS_MAP[bu] ?? "#94a3b8",
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ── Average Price by BU ─────────────────────────────────────────────────────

export interface BUAvgPrice {
  bu: string;
  avgPrice: number;
  color: string;
}

export function computeAvgPriceByBU(deals: DealRow[]): BUAvgPrice[] {
  const won = deals.filter((d) => d.stage === "fechado_ganho");
  const bus = new Map<string, { total: number; count: number }>();

  for (const d of won) {
    const bu = classifyBU(d.name || "");
    const existing = bus.get(bu) ?? { total: 0, count: 0 };
    existing.total += d.value ?? 0;
    existing.count++;
    bus.set(bu, existing);
  }

  return Array.from(bus.entries())
    .map(([bu, v]) => ({
      bu,
      avgPrice: v.count > 0 ? v.total / v.count : 0,
      color: BU_COLORS_MAP[bu] ?? "#94a3b8",
    }))
    .sort((a, b) => b.avgPrice - a.avgPrice);
}

// ── Strategic Insights ──────────────────────────────────────────────────────

export interface StrategicInsight {
  type: "success" | "warning" | "info" | "opportunity";
  title: string;
  description: string;
}

export function computeStrategicInsights(
  deals: DealRow[],
  kpis: CommercialKPIs,
  clients: ClientData[],
  products: ProductData[],
  buDist: BUDistribution[],
): StrategicInsight[] {
  const insights: StrategicInsight[] = [];

  // 1. Client concentration risk
  const top3ClientPct = clients
    .slice(0, 3)
    .reduce((s, c) => s + c.participation, 0);
  if (top3ClientPct > 50) {
    insights.push({
      type: "warning",
      title: "Concentração de Receita",
      description: `Os 3 maiores clientes representam ${top3ClientPct.toFixed(0)}% do faturamento. Diversificar base reduz risco.`,
    });
  }

  // 2. Conversion rate
  if (kpis.conversionRate > 0 && kpis.conversionRate < 25) {
    insights.push({
      type: "opportunity",
      title: "Taxa de Conversão Baixa",
      description: `Conversão atual de ${kpis.conversionRate.toFixed(1)}%. Revisar qualificação de leads e processo de proposta pode elevar resultado.`,
    });
  } else if (kpis.conversionRate >= 40) {
    insights.push({
      type: "success",
      title: "Alta Conversão",
      description: `Taxa de ${kpis.conversionRate.toFixed(1)}% indica qualificação sólida e proposta aderente ao mercado.`,
    });
  }

  // 3. Top product dominance
  if (products.length > 0 && products[0].pctOfTotal > 30) {
    insights.push({
      type: "info",
      title: `"${products[0].name}" Domina o Mix`,
      description: `Representa ${products[0].pctOfTotal.toFixed(1)}% da receita. Avaliar oportunidade de cross-sell com outros serviços.`,
    });
  }

  // 4. BU diversification
  if (buDist.length > 0 && buDist[0].pct > 50) {
    insights.push({
      type: "warning",
      title: `Dependência de ${buDist[0].bu}`,
      description: `${buDist[0].pct.toFixed(0)}% do faturamento vem de uma BU. Fortalecer BUs secundárias para sustentabilidade.`,
    });
  } else if (buDist.length >= 3) {
    const topThree = buDist.slice(0, 3);
    const balanced = topThree.every((b) => b.pct < 40);
    if (balanced) {
      insights.push({
        type: "success",
        title: "Mix Diversificado",
        description: `Receita bem distribuída entre ${topThree.map((b) => b.bu).join(", ")}. Reduz risco operacional.`,
      });
    }
  }

  // 5. Average ticket
  if (kpis.avgTicket > 0) {
    const highValueProducts = products.filter(
      (p) => p.avgUnitPrice > kpis.avgTicket * 2,
    );
    if (highValueProducts.length > 0) {
      insights.push({
        type: "opportunity",
        title: "Produtos de Alto Valor",
        description: `${highValueProducts.map((p) => p.name).slice(0, 3).join(", ")} têm ticket ${((highValueProducts[0].avgUnitPrice / kpis.avgTicket) * 100 - 100).toFixed(0)}% acima da média. Priorizar venda ativa destes.`,
      });
    }
  }

  // 6. Pipeline health
  const openValue = deals
    .filter((d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido")
    .reduce((s, d) => s + (d.value ?? 0), 0);
  if (openValue > 0 && kpis.totalBilled > 0) {
    const pipelineRatio = openValue / kpis.totalBilled;
    if (pipelineRatio < 0.5) {
      insights.push({
        type: "warning",
        title: "Pipeline Abaixo do Ideal",
        description: `Pipeline ativo = ${(pipelineRatio * 100).toFixed(0)}% do faturado. Ideal > 100%. Acelerar prospecção.`,
      });
    } else if (pipelineRatio > 2) {
      insights.push({
        type: "success",
        title: "Pipeline Robusto",
        description: `${(pipelineRatio * 100).toFixed(0)}% do faturado em pipeline. Base sólida para próximos meses.`,
      });
    }
  }

  return insights;
}

// ── Pipeline by Owner ────────────────────────────────────────────────────────

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
