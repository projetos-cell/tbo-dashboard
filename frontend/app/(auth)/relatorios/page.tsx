"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import { useAuthStore } from "@/stores/auth-store";
import {
  IconArrowRight,
  IconArrowsLeftRight,
  IconCalendarClock,
  IconChartBar,
  IconMathFunction,
  IconShieldCheck,
} from "@tabler/icons-react";

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

type ModuleDef = { href: string; label: string; description: string; icon: React.ElementType; color: string };

const MODULES: ModuleDef[] = [
  { href: "/relatorios/bi", label: "BI Dashboards", description: "Dashboards personalizados com gráficos interativos", icon: IconChartBar, color: "#3b82f6" },
  { href: "/relatorios/agendados", label: "Relatórios Agendados", description: "Relatórios automáticos com envio por email", icon: IconCalendarClock, color: "#8b5cf6" },
  { href: "/relatorios/yoy", label: "Year over Year", description: "Comparativos anuais de performance", icon: IconArrowsLeftRight, color: "#22c55e" },
  { href: "/relatorios/unit-economics", label: "Unit Economics", description: "LTV, CAC, margem por cliente e projeto", icon: IconMathFunction, color: "#f59e0b" },
  { href: "/relatorios/qualidade-dados", label: "Qualidade de Dados", description: "Scoring e integridade dos dados do sistema", icon: IconShieldCheck, color: "#ef4444" },
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

export default function RelatoriosPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
        <div className="min-h-[calc(100dvh-64px)] p-5 space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-14 rounded-2xl" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <RequireRole minRole="admin" module="relatorios">
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
        <div className="min-h-[calc(100dvh-64px)] p-5 space-y-4 max-w-4xl mx-auto">
          {/* Header Bar */}
          <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
            <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex gap-2">
                {MODULES.slice(0, 3).map((m) => {
                  const Icon = m.icon;
                  return (
                    <Link key={m.href} href={m.href} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <Icon className="size-3.5" style={{ color: m.color }} />
                      {m.label.split(" ")[0]}
                    </Link>
                  );
                })}
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
        </div>
      </div>
    </RequireRole>
  );
}
