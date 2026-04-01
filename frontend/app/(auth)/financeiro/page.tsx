"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { RBACGuard } from "@/components/rbac-guard";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { OmieSyncButton } from "@/features/financeiro/components/omie-sync-button";
import { fmt } from "@/features/financeiro/lib/formatters";
import {
  IconArrowRight,
  IconCalendarStats,
  IconCash,
  IconChartBar,
  IconCurrencyDollar,
  IconFileCheck,
  IconGitCompare,
  IconReceipt,
  IconReceiptRefund,
  IconRefresh,
  IconReportMoney,
  IconTable,
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

type ModuleDef = { href: string; label: string; description: string; icon: React.ElementType; color: string };

const MODULES: ModuleDef[] = [
  { href: "/financeiro/dre", label: "DRE", description: "Demonstração de resultado do exercício", icon: IconReportMoney, color: "#22c55e" },
  { href: "/financeiro/fluxo-caixa", label: "Fluxo de Caixa", description: "Entradas, saídas e projeções", icon: IconCash, color: "#3b82f6" },
  { href: "/financeiro/transacoes", label: "Transações", description: "Contas a pagar e receber detalhadas", icon: IconCurrencyDollar, color: "#f59e0b" },
  { href: "/financeiro/contas", label: "Contas", description: "Gestão de contas bancárias", icon: IconTable, color: "#8b5cf6" },
  { href: "/financeiro/boletos", label: "Boletos", description: "Emissão e rastreamento de boletos", icon: IconReceipt, color: "#ec4899" },
  { href: "/financeiro/conciliacao", label: "Conciliação", description: "Reconciliação bancária automatizada", icon: IconGitCompare, color: "#14b8a6" },
  { href: "/financeiro/recorrentes", label: "Recorrentes", description: "Receitas e despesas recorrentes", icon: IconReceiptRefund, color: "#6366f1" },
  { href: "/financeiro/fiscal", label: "Fiscal", description: "Notas fiscais e obrigações", icon: IconFileCheck, color: "#f97316" },
  { href: "/financeiro/operacional", label: "Operacional", description: "Headcount, folha e custo operacional", icon: IconCalendarStats, color: "#0ea5e9" },
  { href: "/financeiro/performance", label: "Performance", description: "Indicadores financeiros e benchmarks", icon: IconChartBar, color: "#10b981" },
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

function FinanceiroContent() {
  const [period] = usePersistedPeriod("ytd");
  const { data: d, isLoading } = useFounderDashboard(period);

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="min-h-[calc(100dvh-64px)] p-5 space-y-4 max-w-4xl mx-auto">
        {/* Header Bar */}
        <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
          <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex gap-2">
              <Link href="/financeiro/dre" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
                <IconReportMoney className="size-3.5" style={{ color: "#22c55e" }} />
                DRE
              </Link>
              <Link href="/financeiro/fluxo-caixa" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                <IconCash className="size-3.5" style={{ color: "#3b82f6" }} />
                Fluxo de Caixa
              </Link>
              <Link href="/financeiro/transacoes" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                <IconCurrencyDollar className="size-3.5" style={{ color: "#f59e0b" }} />
                Transações
              </Link>
              <OmieSyncButton />
            </div>
            <div className="flex gap-4">
              {isLoading ? <Skeleton className="h-6 w-24 bg-white/10 rounded" /> : d && (
                <>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white tabular-nums">{fmt(d.receitaRealizada)}</span>
                    <span className="text-[10px] text-white/40 ml-1">receita</span>
                  </div>
                </>
              )}
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
  );
}

export default function FinanceiroPage() {
  return (
    <RBACGuard minRole="admin">
      <FinanceiroContent />
    </RBACGuard>
  );
}
