"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import { useAuthStore } from "@/stores/auth-store";
import { useIntelligenceKpis } from "@/hooks/use-intelligence";
import { ErrorState, EmptyState } from "@/components/shared";
import { AiInsightsSection } from "@/features/inteligencia/components/ai-insights-section";
import { TrendsSection } from "@/features/inteligencia/components/trends-section";
import {
  IconArrowRight,
  IconBrain,
  IconCurrencyDollar,
  IconSearch,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

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

const MODULES = [
  { title: "Visao Financeira", description: "DRE, margens e fluxo de caixa", href: "/financeiro", icon: IconCurrencyDollar, color: "#22c55e" },
  { title: "Pipeline Comercial", description: "Funil de vendas e forecast", href: "/comercial", icon: IconTrendingUp, color: "#3b82f6" },
  { title: "Desempenho da Equipe", description: "Produtividade e alocacao", href: "/pessoas", icon: IconUsers, color: "#8b5cf6" },
  { title: "OKRs & Metas", description: "Progresso de objetivos", href: "/cultura/okrs", icon: IconTarget, color: "#f97316" },
];

function InteligenciaContent() {
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading, error, refetch } = useIntelligenceKpis();

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  if (!user) {
    return (
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
        <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
          <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
            <Skeleton className="h-44 rounded-2xl" />
          </aside>
          <main className="flex-1 min-w-0 p-5 space-y-4">
            <Skeleton className="h-14 rounded-2xl" />
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </main>
          <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
            <Skeleton className="h-44 rounded-2xl" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        {/* Left Sidebar — KPIs */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
          <SectionCard>
            <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Resumo</h3>
            <div className="space-y-2.5">
              {[
                { label: "Recebiveis", value: kpis ? formatCurrency(kpis.totalReceivables) : "—", color: "#22c55e" },
                { label: "Pipeline", value: kpis ? formatCurrency(kpis.pipelineTotal) : "—", color: "#3b82f6" },
                { label: "Equipe ativa", value: kpis ? String(kpis.teamCount) : "—", color: "#8b5cf6" },
                { label: "OKRs", value: kpis ? `${kpis.okrAvgProgress}%` : "—", color: "#f97316" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: T.muted }}>{item.label}</span>
                  {isLoading ? <Skeleton className="h-4 w-16" /> : (
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
                {MODULES.map((m) => {
                  const Icon = m.icon;
                  return (
                    <Link key={m.href} href={m.href} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <Icon className="size-3.5" style={{ color: m.color }} />
                      {m.title.split(" ")[0]}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {!isLoading && !error && !kpis && (
            <EmptyState icon={IconBrain} title="Sem dados de inteligência" description="Os dados analíticos aparecerão aqui assim que houver informações nos módulos conectados." />
          )}

          {/* Module Cards */}
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Módulos</h2>
            <div className="space-y-2">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link key={mod.href} href={mod.href} className="block transition-all hover:scale-[1.005]">
                    <div className="p-4 flex items-center gap-3" style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.rSm, boxShadow: T.glassShadow }}>
                      <div className="rounded-lg p-2.5 shrink-0" style={{ background: `${mod.color}15` }}>
                        <Icon className="size-5" style={{ color: mod.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: T.text }}>{mod.title}</p>
                        <p className="text-[11px] truncate" style={{ color: T.muted }}>{mod.description}</p>
                      </div>
                      <IconArrowRight className="size-4 shrink-0" style={{ color: T.muted }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Trends & AI */}
          <TrendsSection />
          <AiInsightsSection />
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
          <SectionCard>
            <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Acesso Rápido</h3>
            <div className="space-y-1.5">
              {[
                { href: "/relatorios", label: "Relatórios", color: "#22c55e" },
                { href: "/financeiro", label: "DRE & Fluxo de Caixa", color: "#3b82f6" },
                { href: "/comercial", label: "Pipeline CRM", color: "#f59e0b" },
                { href: "/pessoas", label: "Performance Equipe", color: "#8b5cf6" },
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
  );
}

export default function InteligenciaPage() {
  return (
    <RequireRole minRole="lider" module="intelligence">
      <InteligenciaContent />
    </RequireRole>
  );
}
