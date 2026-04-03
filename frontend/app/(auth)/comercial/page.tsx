"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { RequireRole } from "@/features/auth/components/require-role";
import { useDeals } from "@/features/comercial/hooks/use-commercial";
import { useProposals } from "@/features/comercial/hooks/use-proposals";
import { computeDealKPIs } from "@/features/comercial/services/commercial";
import { ErrorState } from "@/components/shared";
import { getDealsNeedingAttention } from "@/features/comercial/lib/follow-up";
import { computeForecast } from "@/features/comercial/lib/forecast";
import { AttentionWidget } from "@/features/comercial/components/attention-widget";
import { ForecastCompactCard } from "@/features/comercial/components/forecast-chart";
import { DealDetailDialog } from "@/features/comercial/components/deal-detail-dialog";
import { DealFormDialog } from "@/features/comercial/components/deal-form-dialog";
import {
  CommercialPeriodFilter,
  filterByPeriod,
  type CommercialPeriodValue,
} from "@/features/comercial/components/period-filter-comercial";
import {
  IconArrowRight,
  IconChartBar,
  IconCurrencyDollar,
  IconFileText,
  IconPackage,
  IconRocket,
  IconTrendingUp,
  IconUsers,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

/* ─── TBO Design Tokens ───────────────────────────────────────────── */

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow: "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
  rSm: "10px",
};

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 ${className}`} style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.r, boxShadow: T.glassShadow }}>
      {children}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

/* ─── Module Definitions ──────────────────────────────────────────── */

type ModuleDef = { href: string; label: string; description: string; icon: React.ElementType; color: string };

const MODULES: ModuleDef[] = [
  { href: "/comercial/pipeline", label: "Pipeline CRM", description: "Kanban de deals, funis e estágios", icon: IconTrendingUp, color: "#3b82f6" },
  { href: "/comercial/leads", label: "Leads & Clientes", description: "Base de contatos e qualificação", icon: IconUsers, color: "#8b5cf6" },
  { href: "/comercial/propostas", label: "Propostas", description: "Geração e acompanhamento de propostas", icon: IconFileText, color: "#f59e0b" },
  { href: "/comercial/servicos", label: "Catálogo de Serviços", description: "Serviços, preços e margens", icon: IconPackage, color: "#22c55e" },
  { href: "/comercial/precificacao", label: "Precificação", description: "Tabelas de preço e simuladores", icon: IconCurrencyDollar, color: "#ec4899" },
  { href: "/comercial/atividades", label: "Atividades", description: "Timeline de movimentações", icon: IconRocket, color: "#14b8a6" },
  { href: "/comercial/relatorios", label: "Relatórios", description: "Analytics e performance comercial", icon: IconChartBar, color: "#6366f1" },
];

function ModuleCard({ mod }: { mod: ModuleDef }) {
  const Icon = mod.icon;
  return (
    <Link href={mod.href} className="block transition-all hover:scale-[1.005]">
      <div className="p-3 flex items-center gap-3" style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.rSm, boxShadow: T.glassShadow }}>
        <div className="rounded-lg p-2 shrink-0" style={{ background: `${mod.color}15` }}>
          <Icon className="size-4" style={{ color: mod.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: T.text }}>{mod.label}</p>
          <p className="text-[11px] truncate" style={{ color: T.muted }}>{mod.description}</p>
        </div>
        <IconArrowRight className="size-4 shrink-0" style={{ color: T.muted }} />
      </div>
    </Link>
  );
}

/* ─── Loading Skeleton ────────────────────────────────────────────── */

function HubSkeleton() {
  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </main>
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
          <Skeleton className="h-44 rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function ComercialPage() {
  const user = useAuthStore((s) => s.user);
  const [period, setPeriod] = useState<CommercialPeriodValue>({ preset: "all" });
  const [selectedDeal, setSelectedDeal] = useState<DealRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRow | null>(null);

  const { data: rawDeals = [], isLoading, error, refetch } = useDeals({});
  const { data: rawProposals = [] } = useProposals();
  const deals = filterByPeriod(rawDeals, period);

  const kpis = useMemo(() => computeDealKPIs(deals), [deals]);
  const attentionDeals = useMemo(() => getDealsNeedingAttention(deals), [deals]);
  const forecast = useMemo(() => computeForecast(deals), [deals]);

  // Propostas pendentes (enviada ha mais de 5 dias)
  const pendingProposals = useMemo(() => {
    const fiveDaysAgo = Date.now() - 5 * 86_400_000;
    return rawProposals.filter((p) => {
      const isSent = ["sent", "enviada"].includes(p.status);
      const sentDate = p.updated_at ? new Date(p.updated_at).getTime() : 0;
      return isSent && sentDate < fiveDaysAgo;
    });
  }, [rawProposals]);

  // Top deals por valor
  const topDeals = useMemo(() => {
    return deals
      .filter((d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido" && (d.value ?? 0) > 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 5);
  }, [deals]);

  // Proximos fechamentos
  const closingSoon = useMemo(() => {
    const weekFromNow = Date.now() + 7 * 86_400_000;
    return deals
      .filter((d) => {
        if (d.stage === "fechado_ganho" || d.stage === "fechado_perdido") return false;
        if (!d.expected_close) return false;
        return new Date(d.expected_close).getTime() <= weekFromNow;
      })
      .sort((a, b) => new Date(a.expected_close!).getTime() - new Date(b.expected_close!).getTime())
      .slice(0, 5);
  }, [deals]);

  function handleDealClick(deal: DealRow) {
    setSelectedDeal(deal);
    setDetailOpen(true);
  }

  function handleEdit(deal: DealRow) {
    setDetailOpen(false);
    setEditingDeal(deal);
    setFormOpen(true);
  }

  if (error) {
    return <RequireRole module="comercial"><ErrorState message={error.message} onRetry={() => refetch()} /></RequireRole>;
  }

  if (!user) return <HubSkeleton />;

  return (
    <RequireRole module="comercial">
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
        <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
          {/* Left Sidebar — KPIs + Forecast */}
          <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4 overflow-y-auto" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: T.text }}>Resumo</h3>
                <CommercialPeriodFilter value={period} onChange={setPeriod} />
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Deals abertos", value: kpis.active, color: "#3b82f6" },
                  { label: "Pipeline total", value: formatCurrency(kpis.pipelineValue), color: "#22c55e" },
                  { label: "Ganhos", value: kpis.won, color: "#10b981" },
                  { label: "Perdidos", value: kpis.lost, color: "#ef4444" },
                  { label: "Win rate", value: kpis.conversionRate ? `${kpis.conversionRate.toFixed(0)}%` : "—", color: T.muted },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: T.muted }}>{item.label}</span>
                    {isLoading ? <Skeleton className="h-4 w-12" /> : (
                      <span className="text-sm font-semibold tabular-nums" style={{ color: T.text }}>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Forecast</h3>
              <ForecastCompactCard data={forecast} />
            </SectionCard>
          </aside>

          {/* Center */}
          <main className="flex-1 min-w-0 p-5 space-y-4 overflow-y-auto">
            {/* Header Bar */}
            <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
              <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <Link href="/comercial/pipeline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
                    <IconTrendingUp className="size-3.5" style={{ color: "#3b82f6" }} />Pipeline
                  </Link>
                  <Link href="/comercial/leads" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconUsers className="size-3.5" style={{ color: "#8b5cf6" }} />Leads
                  </Link>
                  <Link href="/comercial/propostas" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconFileText className="size-3.5" style={{ color: "#f59e0b" }} />Propostas
                  </Link>
                  <Link href="/comercial/relatorios" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconChartBar className="size-3.5" style={{ color: "#22c55e" }} />Analytics
                  </Link>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <span className="text-lg font-bold text-white tabular-nums">{deals.length}</span>
                    <span className="text-[10px] text-white/40 ml-1">deals</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white tabular-nums">{formatCurrency(kpis.pipelineValue)}</span>
                    <span className="text-[10px] text-white/40 ml-1">pipeline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attention Required */}
            {attentionDeals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconAlertTriangle className="size-4" style={{ color: "#f59e0b" }} />
                  <h2 className="text-sm font-semibold" style={{ color: T.text }}>Atenção Necessária</h2>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{attentionDeals.length}</Badge>
                </div>
                <AttentionWidget items={attentionDeals} onDealClick={handleDealClick} maxItems={4} />
              </div>
            )}

            {/* Pending Proposals */}
            {pendingProposals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconFileText className="size-4" style={{ color: "#3b82f6" }} />
                  <h2 className="text-sm font-semibold" style={{ color: T.text }}>Propostas Pendentes</h2>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{pendingProposals.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {pendingProposals.slice(0, 3).map((p) => (
                    <Link key={p.id} href={`/comercial/propostas/${p.id}`} className="block">
                      <div className="rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-[11px] text-gray-500">{p.company} · enviada ha {Math.floor((Date.now() - new Date(p.updated_at ?? "").getTime()) / 86_400_000)}d</p>
                          </div>
                          {p.value > 0 && (
                            <span className="text-sm font-semibold tabular-nums text-blue-600 shrink-0">{formatCurrency(p.value)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Modules */}
            <div>
              <h2 className="text-sm font-semibold mb-2" style={{ color: T.text }}>Módulos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MODULES.map((mod) => (
                  <ModuleCard key={mod.href} mod={mod} />
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4 overflow-y-auto" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
            {/* Top deals */}
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Top Deals</h3>
              <div className="space-y-2">
                {topDeals.length === 0 && <p className="text-xs text-gray-400">Nenhum deal ativo com valor.</p>}
                {topDeals.map((deal, i) => (
                  <button key={deal.id} className="w-full text-left flex items-center gap-2 py-1 hover:bg-black/[0.02] rounded-lg px-1 transition-colors" onClick={() => handleDealClick(deal)}>
                    <span className="text-[10px] font-bold text-gray-400 w-4 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{deal.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{deal.company}</p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums shrink-0">{formatCurrency(deal.value ?? 0)}</span>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Closing soon */}
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Próximos Fechamentos</h3>
              <div className="space-y-2">
                {closingSoon.length === 0 && <p className="text-xs text-gray-400">Nenhum deal com fechamento esta semana.</p>}
                {closingSoon.map((deal) => (
                  <button key={deal.id} className="w-full text-left flex items-center gap-2 py-1 hover:bg-black/[0.02] rounded-lg px-1 transition-colors" onClick={() => handleDealClick(deal)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{deal.name}</p>
                      <p className="text-[10px] text-gray-400">{deal.company}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 tabular-nums shrink-0">
                      {new Date(deal.expected_close!).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Quick links */}
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Acesso Rápido</h3>
              <div className="space-y-1.5">
                {[
                  { href: "/comercial/pipeline", label: "Ver Pipeline Kanban", color: "#3b82f6" },
                  { href: "/contratos", label: "Contratos", color: "#f59e0b" },
                  { href: "/comercial/atividades", label: "Atividades CRM", color: "#8b5cf6" },
                  { href: "/comercial/relatorios", label: "Analytics & Forecast", color: "#22c55e" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-black/[0.03]">
                    <span className="size-2 rounded-full shrink-0" style={{ background: link.color }} />
                    <span className="text-xs font-medium flex-1" style={{ color: T.text }}>{link.label}</span>
                    <IconArrowRight className="size-3 shrink-0" style={{ color: T.muted }} />
                  </Link>
                ))}
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>

      {/* Dialogs */}
      <DealDetailDialog deal={selectedDeal} open={detailOpen} onOpenChange={setDetailOpen} onEdit={handleEdit} />
      <DealFormDialog open={formOpen} onOpenChange={setFormOpen} deal={editingDeal} />
    </RequireRole>
  );
}
