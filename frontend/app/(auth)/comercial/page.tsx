"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { RequireRole } from "@/features/auth/components/require-role";
import { useDeals } from "@/features/comercial/hooks/use-commercial";
import { computeDealKPIs } from "@/features/comercial/services/commercial";
import { ErrorState } from "@/components/shared";
import {
  IconArrowRight,
  IconChartBar,
  IconCurrencyDollar,
  IconFileText,
  IconPackage,
  IconPlus,
  IconRocket,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

/* ─── TBO Design Tokens ───────────────────────────────────────────── */

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  orangeGlow: "rgba(196,90,26,0.10)",
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

type ModuleDef = {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

const MODULES: ModuleDef[] = [
  { href: "/comercial/pipeline", label: "Pipeline CRM", description: "Kanban de deals, funis e estágios", icon: IconTrendingUp, color: "#3b82f6" },
  { href: "/comercial/leads", label: "Leads & Clientes", description: "Base de contatos e qualificação", icon: IconUsers, color: "#8b5cf6" },
  { href: "/comercial/propostas", label: "Propostas", description: "Geração e acompanhamento de propostas", icon: IconFileText, color: "#f59e0b" },
  { href: "/comercial/servicos", label: "Catálogo de Serviços", description: "Serviços, preços e margens", icon: IconPackage, color: "#22c55e" },
  { href: "/comercial/precificacao", label: "Precificação", description: "Tabelas de preço e simuladores", icon: IconCurrencyDollar, color: "#ec4899" },
  { href: "/comercial/demandas", label: "Demandas", description: "Demandas comerciais recebidas", icon: IconTargetArrow, color: "#14b8a6" },
  { href: "/comercial/relatorios", label: "Relatórios", description: "Analytics e performance comercial", icon: IconChartBar, color: "#6366f1" },
  { href: "/comercial/integracoes", label: "Integrações", description: "RD Station, Omie e conectores", icon: IconSettings, color: "#9ca3af" },
];

function ModuleCard({ mod }: { mod: ModuleDef }) {
  const Icon = mod.icon;
  return (
    <Link href={mod.href} className="block transition-all hover:scale-[1.005]">
      <div className="p-4 flex items-center gap-3" style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.rSm, boxShadow: T.glassShadow }}>
        <div className="rounded-lg p-2.5 shrink-0" style={{ background: `${mod.color}15` }}>
          <Icon className="size-5" style={{ color: mod.color }} />
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
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
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
  const { data: deals = [], isLoading, error, refetch } = useDeals({});

  const kpis = useMemo(() => computeDealKPIs(deals), [deals]);

  if (error) {
    return (
      <RequireRole module="comercial">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </RequireRole>
    );
  }

  if (!user) return <HubSkeleton />;

  return (
    <RequireRole module="comercial">
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
        <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
          {/* Left Sidebar — KPIs */}
          <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Resumo</h3>
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
          </aside>

          {/* Center */}
          <main className="flex-1 min-w-0 p-5 space-y-4">
            {/* Header Bar */}
            <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
              <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex gap-2">
                  <Link href="/comercial/pipeline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
                    <IconTrendingUp className="size-3.5" style={{ color: "#3b82f6" }} />
                    Pipeline
                  </Link>
                  <Link href="/comercial/leads" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconUsers className="size-3.5" style={{ color: "#8b5cf6" }} />
                    Leads
                  </Link>
                  <Link href="/comercial/propostas" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconFileText className="size-3.5" style={{ color: "#f59e0b" }} />
                    Propostas
                  </Link>
                  <Link href="/comercial/servicos" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconPackage className="size-3.5" style={{ color: "#22c55e" }} />
                    Serviços
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

            {/* Modules */}
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Módulos</h2>
              <div className="space-y-2">
                {MODULES.map((mod) => (
                  <ModuleCard key={mod.href} mod={mod} />
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar — Quick Links */}
          <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Acesso Rápido</h3>
              <div className="space-y-1.5">
                {[
                  { href: "/comercial/pipeline", label: "Ver Pipeline Kanban", color: "#3b82f6" },
                  { href: "/contratos", label: "Contratos", color: "#f59e0b" },
                  { href: "/comercial/atividades", label: "Atividades CRM", color: "#8b5cf6" },
                  { href: "/comercial/relatorios", label: "Analytics Comercial", color: "#22c55e" },
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
    </RequireRole>
  );
}
