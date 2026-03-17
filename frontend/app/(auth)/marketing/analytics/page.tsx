"use client";

import Link from "next/link";
import {
  IconChartBar,
  IconFilter,
  IconTargetArrow,
  IconFileText,
  IconArrowRight,
  IconTrendingUp,
  IconUsers,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import { useMarketingKPIs } from "@/features/marketing/hooks/use-marketing-analytics";

function KPICard({ label, value, icon: Icon, color, isLoading }: { label: string; value: string; icon: React.ElementType; color: string; isLoading?: boolean }) {
  if (isLoading) return <div className="rounded-lg border bg-card p-4 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-7 w-16" /></div>;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2"><Icon className="size-4" style={{ color }} /><p className="text-xs text-muted-foreground">{label}</p></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

const SECTIONS = [
  { href: "/marketing/analytics/funil", label: "Funil", description: "RD Station -> Comercial: conversao por etapa", icon: IconFilter, color: "#8b5cf6", bgClass: "bg-purple-500/10" },
  { href: "/marketing/analytics/attribution", label: "Atribuicao", description: "Canal -> Lead -> Venda: atribuicao de receita", icon: IconTargetArrow, color: "#3b82f6", bgClass: "bg-blue-500/10" },
  { href: "/marketing/analytics/relatorios", label: "Relatorios", description: "Relatorios comparativos e exportacao", icon: IconFileText, color: "#f59e0b", bgClass: "bg-amber-500/10" },
] as const;

function AnalyticsContent() {
  const { data: kpis, isLoading } = useMarketingKPIs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics de Marketing</h1>
        <p className="text-sm text-muted-foreground">
          Dashboard consolidado com metricas de marketing, funil e atribuicao.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Leads gerados" value={String(kpis?.find((k) => k.label === "leads")?.value ?? 0)} icon={IconUsers} color="#3b82f6" isLoading={isLoading} />
        <KPICard label="Oportunidades" value={String(kpis?.find((k) => k.label === "opportunities")?.value ?? 0)} icon={IconTrendingUp} color="#8b5cf6" isLoading={isLoading} />
        <KPICard label="Receita gerada" value={`R$ ${((kpis?.find((k) => k.label === "revenue")?.value ?? 0) / 100).toLocaleString("pt-BR")}`} icon={IconCurrencyDollar} color="#22c55e" isLoading={isLoading} />
        <KPICard label="CAC" value={`R$ ${((kpis?.find((k) => k.label === "cac")?.value ?? 0) / 100).toLocaleString("pt-BR")}`} icon={IconCurrencyDollar} color="#f59e0b" isLoading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full transition-colors group-hover:border-indigo-400/40">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${s.bgClass}`}>
                      <Icon className="size-5" style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{s.label}</p>
                    </div>
                    <IconArrowRight className="size-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <RequireRole module="marketing" minRole="diretoria">
      <AnalyticsContent />
    </RequireRole>
  );
}
