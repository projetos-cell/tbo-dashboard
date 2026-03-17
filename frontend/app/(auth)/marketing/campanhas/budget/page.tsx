"use client";

import {
  IconCurrencyDollar,
  IconPlus,
  IconTrendingUp,
  IconReceipt,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useMarketingCampaigns } from "@/features/marketing/hooks/use-marketing-campaigns";

function KPICard({ label, value, icon: Icon, color, isLoading }: { label: string; value: string; icon: React.ElementType; color: string; isLoading?: boolean }) {
  if (isLoading) return <div className="rounded-lg border bg-card p-4 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-7 w-16" /></div>;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2"><Icon className="size-4" style={{ color }} /><p className="text-xs text-muted-foreground">{label}</p></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function BudgetContent() {
  const { data: campaigns, isLoading } = useMarketingCampaigns();

  const totalBudget = (campaigns ?? []).reduce((s, c) => s + (c.budget ?? 0), 0);
  const totalSpent = (campaigns ?? []).reduce((s, c) => s + (c.spent ?? 0), 0);
  const remaining = totalBudget - totalSpent;
  const utilizationPct = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : "0";

  const fmt = (v: number) => `R$ ${(v / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget & ROI</h1>
          <p className="text-sm text-muted-foreground">Controle de orcamento e retorno sobre investimento.</p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Adicionar Gasto
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Budget total" value={fmt(totalBudget)} icon={IconCurrencyDollar} color="#3b82f6" isLoading={isLoading} />
        <KPICard label="Gasto" value={fmt(totalSpent)} icon={IconReceipt} color="#f59e0b" isLoading={isLoading} />
        <KPICard label="Disponivel" value={fmt(remaining)} icon={IconCurrencyDollar} color="#22c55e" isLoading={isLoading} />
        <KPICard label="Utilizacao" value={`${utilizationPct}%`} icon={IconTrendingUp} color="#8b5cf6" isLoading={isLoading} />
      </div>

      {!isLoading && campaigns && campaigns.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget por Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campanha</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Budget</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Gasto</th>
                    <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {campaigns.filter((c) => c.budget != null && c.budget > 0).map((c) => {
                    const pct = c.budget ? (((c.spent ?? 0) / c.budget) * 100).toFixed(0) : "0";
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-right">{fmt(c.budget ?? 0)}</td>
                        <td className="px-4 py-3 text-right">{fmt(c.spent ?? 0)}</td>
                        <td className="hidden px-4 py-3 text-right md:table-cell">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : !isLoading ? (
        <EmptyState icon={IconCurrencyDollar} title="Sem dados de budget" description="Adicione budgets as campanhas para acompanhar gastos e ROI." />
      ) : null}
    </div>
  );
}

export default function BudgetPage() {
  return (
    <RequireRole module="marketing">
      <BudgetContent />
    </RequireRole>
  );
}
