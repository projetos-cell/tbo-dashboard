"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { RBACGuard } from "@/components/rbac-guard";
import { ErrorState } from "@/components/shared";
import { usePeopleKPIs } from "@/features/people/hooks/use-people";
import {
  IconArrowRight,
  IconAward,
  IconChartBar,
  IconGitBranch,
  IconHierarchy,
  IconSearch,
  IconSettings,
  IconTimeline,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
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

type ModuleDef = { href: string; label: string; description: string; icon: React.ElementType; color: string };

const MODULES: ModuleDef[] = [
  { href: "/pessoas/colaboradores", label: "Colaboradores", description: "Diretório completo do time", icon: IconUsersGroup, color: "#3b82f6" },
  { href: "/pessoas/1on1", label: "1:1s", description: "Reuniões individuais e feedback", icon: IconUsers, color: "#8b5cf6" },
  { href: "/pessoas/pdi", label: "PDI", description: "Planos de desenvolvimento individual", icon: IconGitBranch, color: "#22c55e" },
  { href: "/pessoas/carreira", label: "Carreira", description: "Trilhas, níveis e promoções", icon: IconTimeline, color: "#f59e0b" },
  { href: "/pessoas/performance", label: "Performance", description: "Avaliações e scoring", icon: IconChartBar, color: "#ec4899" },
  { href: "/pessoas/reconhecimentos", label: "Reconhecimentos", description: "Celebrações e kudos do time", icon: IconAward, color: "#f97316" },
  { href: "/pessoas/organograma", label: "Organograma", description: "Estrutura organizacional visual", icon: IconHierarchy, color: "#6366f1" },
  { href: "/pessoas/timeline", label: "Timeline", description: "Histórico de eventos do time", icon: IconTimeline, color: "#14b8a6" },
  { href: "/pessoas/configuracoes", label: "Configurações", description: "Campos, automações e regras", icon: IconSettings, color: "#9ca3af" },
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

function HubSkeleton() {
  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
          <Skeleton className="h-44 rounded-2xl" />
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <Skeleton className="h-14 rounded-2xl" />
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </main>
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
          <Skeleton className="h-44 rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}

export default function PessoasPage() {
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading } = usePeopleKPIs();

  if (!user) return <HubSkeleton />;

  return (
    <RBACGuard minRole="colaborador">
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
        <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
          {/* Left Sidebar — KPIs */}
          <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Resumo</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Total", value: kpis?.total ?? 0, color: T.muted },
                  { label: "Ativos", value: kpis?.active ?? 0, color: "#22c55e" },
                  { label: "Onboarding", value: kpis?.onboarding ?? 0, color: "#3b82f6" },
                  { label: "Em risco", value: kpis?.at_risk ?? 0, color: "#ef4444" },
                  { label: "1:1 pendente", value: kpis?.pending_1on1 ?? 0, color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: T.muted }}>{item.label}</span>
                    {isLoading ? <Skeleton className="h-4 w-10" /> : (
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
                  <Link href="/pessoas/colaboradores" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
                    <IconUsersGroup className="size-3.5" style={{ color: "#3b82f6" }} />
                    Colaboradores
                  </Link>
                  <Link href="/pessoas/1on1" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconUsers className="size-3.5" style={{ color: "#8b5cf6" }} />
                    1:1s
                  </Link>
                  <Link href="/pessoas/performance" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconChartBar className="size-3.5" style={{ color: "#ec4899" }} />
                    Performance
                  </Link>
                  <Link href="/pessoas/organograma" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <IconHierarchy className="size-3.5" style={{ color: "#6366f1" }} />
                    Organograma
                  </Link>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white tabular-nums">{kpis?.total ?? 0}</span>
                  <span className="text-[10px] text-white/40 ml-1">pessoas</span>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Módulos</h2>
              <div className="space-y-2">
                {MODULES.map((mod) => <ModuleCard key={mod.href} mod={mod} />)}
              </div>
            </div>
          </main>

          {/* Right Sidebar — Quick Links */}
          <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Acesso Rápido</h3>
              <div className="space-y-1.5">
                {[
                  { href: "/pessoas/colaboradores", label: "Ver diretório", color: "#3b82f6" },
                  { href: "/pessoas/reconhecimentos", label: "Reconhecimentos", color: "#f97316" },
                  { href: "/pessoas/pdi", label: "Planos de Desenvolvimento", color: "#22c55e" },
                  { href: "/pessoas/carreira", label: "Trilhas de Carreira", color: "#f59e0b" },
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
    </RBACGuard>
  );
}
