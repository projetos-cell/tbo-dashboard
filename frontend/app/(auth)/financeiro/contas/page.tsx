"use client";

import { RBACGuard } from "@/components/rbac-guard";
import { useQueryParam } from "@/hooks/use-query-param";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgingChart } from "@/features/financeiro/components/aging-chart";
import { useOverdueEntries, useFinanceAging } from "@/features/financeiro/hooks/use-finance";
import { Skeleton } from "@/components/ui/skeleton";
import { fmt } from "@/features/financeiro/lib/formatters";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function EntryTable({
  entries,
  isProjected,
}: {
  entries: Array<{
    id: string;
    type: "receita" | "despesa";
    description: string;
    counterpart: string | null;
    cost_center_name: string | null;
    amount: number;
    due_date: string;
    days_overdue: number;
    isProjected: boolean;
  }>;
  isProjected: boolean;
}) {
  const getDaysColor = (days: number, projected: boolean) => {
    if (projected) {
      if (days <= -180) return "text-blue-700 bg-blue-100";
      if (days <= -90) return "text-blue-600 bg-blue-50";
      if (days <= -30) return "text-sky-600 bg-sky-50";
      return "text-cyan-700 bg-cyan-50";
    }
    if (days > 90) return "text-red-700 bg-red-100";
    if (days > 60) return "text-red-600 bg-red-50";
    if (days > 30) return "text-orange-600 bg-orange-50";
    return "text-yellow-700 bg-yellow-50";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Tipo</th>
            <th className="pb-2 font-medium">Descrição</th>
            <th className="pb-2 font-medium">Cliente/Fornecedor</th>
            <th className="pb-2 font-medium">Centro de Custos</th>
            <th className="pb-2 font-medium text-right pr-4">Valor</th>
            <th className="pb-2 font-medium pl-4">Vencimento</th>
            <th className="pb-2 font-medium text-right">
              {isProjected ? "Prazo" : "Atraso"}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b last:border-0">
              <td className="py-2">
                <Badge
                  variant="outline"
                  className={
                    entry.type === "receita"
                      ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                      : "text-red-700 border-red-300 bg-red-50"
                  }
                >
                  {entry.type === "receita" ? "Receber" : "Pagar"}
                </Badge>
              </td>
              <td className="py-2 max-w-[200px] truncate" title={entry.description}>
                {entry.description}
              </td>
              <td className="py-2 text-muted-foreground">
                {entry.counterpart || "Sem identificação"}
              </td>
              <td className="py-2 text-muted-foreground text-xs">
                {entry.cost_center_name ?? "—"}
              </td>
              <td
                className={`py-2 text-right font-medium pr-4 ${
                  entry.type === "receita" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {fmt(entry.amount)}
              </td>
              <td className="py-2 text-muted-foreground pl-4">
                {new Date(entry.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
              </td>
              <td className="py-2 text-right">
                <Badge className={getDaysColor(entry.days_overdue, isProjected)}>
                  {isProjected
                    ? `${Math.abs(entry.days_overdue)}d`
                    : `${entry.days_overdue}d`}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContasContent() {
  const [tabRaw, setTab] = useQueryParam("tipo", "all");
  const tab = (["all", "ar", "ap"].includes(tabRaw) ? tabRaw : "all") as
    | "all"
    | "ar"
    | "ap";
  const { data: aging } = useFinanceAging();
  const { data, isLoading, isError, refetch } = useOverdueEntries(tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Contas a Pagar / Receber
        </h1>
        <p className="text-sm text-muted-foreground">
          Inadimplência, projeção de recebíveis (12 meses) e títulos pendentes.
        </p>
      </div>

      {/* Summary cards — 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <ArrowDownCircle className="size-3.5 text-emerald-500" />
              AR Vencido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-600">
              {fmt(aging?.totalAr ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {aging?.totalArCount ?? 0} títulos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <ArrowUpCircle className="size-3.5 text-red-500" />
              AP Vencido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600">
              {fmt(aging?.totalAp ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {aging?.totalApCount ?? 0} títulos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <TrendingUp className="size-3.5 text-blue-500" />
              AR Projetado (12m)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-blue-600">
              {fmt(aging?.projectedAr ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {aging?.projectedArCount ?? 0} títulos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Gap (AR - AP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const gap = (aging?.totalAr ?? 0) - (aging?.totalAp ?? 0);
              return (
                <p
                  className={`text-xl font-bold ${gap >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {fmt(gap)}
                </p>
              );
            })()}
            <p className="text-xs text-muted-foreground">vencidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Total Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {(aging?.totalArCount ?? 0) + (aging?.totalApCount ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">títulos em atraso</p>
          </CardContent>
        </Card>
      </div>

      {/* Aging chart (now shows overdue + projected) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Inadimplência e Projeção AR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgingChart />
        </CardContent>
      </Card>

      {/* Overdue entries table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="size-4 text-red-500" />
            Títulos Vencidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "all" | "ar" | "ap")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="ar">A Receber</TabsTrigger>
              <TabsTrigger value="ap">A Pagar</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-red-500">
                  <AlertCircle className="h-6 w-6" />
                  <p className="text-sm">Erro ao carregar títulos vencidos</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : !data?.entries.length ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Clock className="h-8 w-8" />
                  <p className="text-sm font-medium">Nenhum título vencido</p>
                  <p className="text-xs">
                    Todos os títulos estão em dia nesta categoria.
                  </p>
                </div>
              ) : (
                <>
                  <EntryTable
                    entries={data.entries}
                    isProjected={false}
                  />
                  <div className="mt-4 flex gap-6 text-sm font-medium border-t pt-3">
                    {(tab === "all" || tab === "ar") && (
                      <span className="text-emerald-600">
                        Total AR: {fmt(data.totalAr)} ({data.totalArCount}{" "}
                        títulos)
                      </span>
                    )}
                    {(tab === "all" || tab === "ap") && (
                      <span className="text-red-600">
                        Total AP: {fmt(data.totalAp)} ({data.totalApCount}{" "}
                        títulos)
                      </span>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Projected AR table — always visible when tab is "all" or "ar" */}
      {(tab === "all" || tab === "ar") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarClock className="size-4 text-blue-500" />
              A Receber — Projeção 12 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !data?.projectedEntries.length ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <CalendarClock className="h-8 w-8" />
                <p className="text-sm font-medium">
                  Nenhum recebível projetado
                </p>
                <p className="text-xs">
                  Não há títulos a receber nos próximos 12 meses.
                </p>
              </div>
            ) : (
              <>
                <EntryTable
                  entries={data.projectedEntries}
                  isProjected={true}
                />
                <div className="mt-4 flex gap-6 text-sm font-medium border-t pt-3">
                  <span className="text-blue-600">
                    Total Projetado: {fmt(data.projectedAr)} (
                    {data.projectedArCount} títulos)
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ContasPage() {
  return (
    <RBACGuard minRole="diretoria">
      <ContasContent />
    </RBACGuard>
  );
}
