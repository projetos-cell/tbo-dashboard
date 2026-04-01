"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { useCulturaItems } from "@/features/cultura/hooks/use-cultura";
import { useRecognitionKPIs } from "@/features/cultura/hooks/use-reconhecimentos";
import { useRitualTypes } from "@/features/cultura/hooks/use-ritual-types";
import { useRewardsKPIs } from "@/features/cultura/hooks/use-rewards";
import {
  IconArrowRight,
  IconAward,
  IconBookmark,
  IconBox,
  IconCalendarHeart,
  IconChartBar,
  IconClipboardCheck,
  IconFileText,
  IconGift,
  IconHeart,
  IconRepeat,
  IconScale,
  IconSchool,
  IconSearch,
  IconStethoscope,
  IconTarget,
  IconTool,
} from "@tabler/icons-react";

/* ─── TBO Design Tokens ───────────────────────────────────────────── */

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  orangeGlow: "rgba(196,90,26,0.10)",
  borderSolid: "#e0dcd7",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow: "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
  rSm: "10px",
};

/* ─── Section Card ────────────────────────────────────────────────── */

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`p-5 ${className}`}
      style={{
        background: T.glass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid ${T.glassBorder}`,
        borderRadius: T.r,
        boxShadow: T.glassShadow,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Header Bar ──────────────────────────────────────────────────── */

function CulturaHeaderBar({ totalItems }: { totalItems: number }) {
  return (
    <div
      className="relative overflow-hidden p-4"
      style={{
        background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)",
        borderRadius: T.r,
        boxShadow: "0 8px 32px rgba(196,90,26,0.15)",
      }}
    >
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" />
        <div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" />
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/cultura/reconhecimentos" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
            <IconAward className="size-3.5" style={{ color: "#f59e0b" }} />
            Reconhecimentos
          </Link>
          <Link href="/cultura/okrs" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
            <IconTarget className="size-3.5" style={{ color: "#10b981" }} />
            OKRs
          </Link>
          <Link href="/cultura/blog" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
            <IconFileText className="size-3.5" style={{ color: "#0ea5e9" }} />
            Blog
          </Link>
          <Link href="/cultura/recompensas" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
            <IconGift className="size-3.5" style={{ color: "#ec4899" }} />
            Rewards
          </Link>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-white tabular-nums">{totalItems}</span>
          <span className="text-[10px] text-white/40 ml-1">itens</span>
        </div>
      </div>
    </div>
  );
}

/* ─── KPIs Widget ─────────────────────────────────────────────────── */

function KPIsWidget({
  recognitionCount,
  ritualCount,
  rewardsCount,
  totalItems,
  isLoading,
}: {
  recognitionCount: number;
  ritualCount: number;
  rewardsCount: number;
  totalItems: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <SectionCard>
        <Skeleton className="h-4 w-16 mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full mb-2" />
        ))}
      </SectionCard>
    );
  }

  const items = [
    { label: "Reconhecimentos", value: recognitionCount, color: "#f59e0b" },
    { label: "Rituais", value: ritualCount, color: "#3b82f6" },
    { label: "Recompensas", value: rewardsCount, color: "#ec4899" },
    { label: "Total itens", value: totalItems, color: T.muted },
  ];

  return (
    <SectionCard>
      <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Resumo</h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: T.muted }}>{item.label}</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: T.text }}>{item.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ─── Quick Links Widget ──────────────────────────────────────────── */

function QuickLinksWidget() {
  const links = [
    { href: "/cultura/pilares", label: "Valores & Pilares", icon: IconHeart, color: "#ef4444" },
    { href: "/cultura/calendario-rh", label: "Calendário RH", icon: IconCalendarHeart, color: "#f97316" },
    { href: "/cultura/conhecimento", label: "Base de Conhecimento", icon: IconBookmark, color: "#6366f1" },
    { href: "/cultura/academy", label: "TBO Academy", icon: IconSchool, color: "#059669" },
  ];

  return (
    <SectionCard>
      <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Acesso Rápido</h3>
      <div className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-black/[0.03]">
              <Icon className="size-3.5 shrink-0" style={{ color: link.color }} />
              <span className="text-xs font-medium flex-1" style={{ color: T.text }}>{link.label}</span>
              <IconArrowRight className="size-3 shrink-0" style={{ color: T.muted }} />
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ─── Search Bar ──────────────────────────────────────────────────── */

function CulturaSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3"
      style={{
        background: T.glass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid ${T.glassBorder}`,
        borderRadius: T.r,
        boxShadow: T.glassShadow,
      }}
    >
      <IconSearch className="size-4 shrink-0" style={{ color: T.muted }} />
      <input
        type="text"
        placeholder="Buscar em cultura..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9a9a9a]"
        style={{ color: T.text }}
      />
    </div>
  );
}

/* ─── Module Definitions ──────────────────────────────────────────── */

type ModuleDef = {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  adminOnly?: boolean;
};

const MODULES: ModuleDef[] = [
  { href: "/cultura/pilares", label: "Valores & Pilares", description: "Fundamentos da identidade TBO", icon: IconHeart, color: "#ef4444" },
  { href: "/cultura/rituais", label: "Rituais", description: "Cerimônias e práticas recorrentes", icon: IconRepeat, color: "#3b82f6" },
  { href: "/cultura/reconhecimentos", label: "Reconhecimentos", description: "Celebrar quem faz a diferença", icon: IconAward, color: "#f59e0b" },
  { href: "/cultura/recompensas", label: "TBO Rewards", description: "Catálogo de recompensas e resgates", icon: IconGift, color: "#ec4899" },
  { href: "/cultura/okrs", label: "OKRs", description: "Objetivos e resultados-chave", icon: IconTarget, color: "#10b981" },
  { href: "/cultura/conhecimento", label: "Base de Conhecimento", description: "SOPs, templates e guias por BU", icon: IconBookmark, color: "#6366f1" },
  { href: "/cultura/blog", label: "Blog Interno", description: "Artigos e comunicados internos", icon: IconFileText, color: "#0ea5e9" },
  { href: "/cultura/decisoes", label: "Decisões", description: "Registro de decisões estratégicas", icon: IconScale, color: "#8b5cf6" },
  { href: "/cultura/academy", label: "TBO Academy", description: "Trilhas de aprendizado cultural", icon: IconSchool, color: "#059669" },
  { href: "/cultura/calendario-rh", label: "Calendário RH", description: "Eventos, datas e marcos do time", icon: IconCalendarHeart, color: "#f97316" },
  { href: "/cultura/pesquisa-clima", label: "Pesquisa de Clima", description: "Pulso organizacional e feedback", icon: IconClipboardCheck, color: "#14b8a6" },
  { href: "/cultura/bau-criativo", label: "Baú Criativo", description: "Referências e inspirações visuais", icon: IconBox, color: "#8b5cf6" },
  { href: "/cultura/ferramentas", label: "Guia de Ferramentas", description: "Ferramentas oficiais e boas práticas", icon: IconTool, color: "#06b6d4" },
  { href: "/cultura/diagnostico", label: "Diagnóstico", description: "Avaliação de maturidade cultural", icon: IconStethoscope, color: "#f43f5e", adminOnly: true },
  { href: "/cultura/analytics", label: "Analytics de Cultura", description: "Métricas e insights de cultura", icon: IconChartBar, color: "#6366f1", adminOnly: true },
];

function ModuleCard({ mod }: { mod: ModuleDef }) {
  const Icon = mod.icon;
  return (
    <Link href={mod.href} className="block transition-all hover:scale-[1.005]">
      <div
        className="p-4 flex items-center gap-3"
        style={{
          background: T.glass,
          backdropFilter: T.glassBlur,
          WebkitBackdropFilter: T.glassBlur,
          border: `1px solid ${T.glassBorder}`,
          borderRadius: T.rSm,
          boxShadow: T.glassShadow,
        }}
      >
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
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </main>
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
          <Skeleton className="h-40 rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function CulturaPage() {
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items, isLoading, error, refetch } = useCulturaItems();
  const { data: recKPIs } = useRecognitionKPIs();
  const { data: rituals } = useRitualTypes();
  const { data: rewardKPIs } = useRewardsKPIs();

  const totalItems = items?.length ?? 0;
  const recognitionCount = recKPIs?.total ?? 0;
  const ritualCount = rituals?.length ?? 0;
  const rewardsCount = rewardKPIs?.activeRewards ?? 0;

  const publicModules = useMemo(() => MODULES.filter((m) => !m.adminOnly), []);
  const adminModules = useMemo(() => MODULES.filter((m) => m.adminOnly), []);

  const filteredPublic = useMemo(() => {
    if (!searchQuery) return publicModules;
    const q = searchQuery.toLowerCase();
    return publicModules.filter((m) => m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }, [searchQuery, publicModules]);

  const filteredAdmin = useMemo(() => {
    if (!searchQuery) return adminModules;
    const q = searchQuery.toLowerCase();
    return adminModules.filter((m) => m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }, [searchQuery, adminModules]);

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  if (!user) return <HubSkeleton />;

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        {/* Left Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4"
          style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}
        >
          <KPIsWidget
            recognitionCount={recognitionCount}
            ritualCount={ritualCount}
            rewardsCount={rewardsCount}
            totalItems={totalItems}
            isLoading={isLoading}
          />
        </aside>

        {/* Center */}
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <CulturaHeaderBar totalItems={totalItems} />
          <CulturaSearch value={searchQuery} onChange={setSearchQuery} />

          {/* Public Modules */}
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Módulos</h2>
            <div className="space-y-2">
              {filteredPublic.map((mod) => (
                <ModuleCard key={mod.href} mod={mod} />
              ))}
            </div>
          </div>

          {/* Admin Modules */}
          {filteredAdmin.length > 0 && (
            <RequireRole minRole="admin">
              <div>
                <h2 className="text-sm font-semibold mb-3" style={{ color: T.muted }}>Administração</h2>
                <div className="space-y-2">
                  {filteredAdmin.map((mod) => (
                    <ModuleCard key={mod.href} mod={mod} />
                  ))}
                </div>
              </div>
            </RequireRole>
          )}
        </main>

        {/* Right Sidebar */}
        <aside
          className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4"
          style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}
        >
          <QuickLinksWidget />
        </aside>
      </div>
    </div>
  );
}
