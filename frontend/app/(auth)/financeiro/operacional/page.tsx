"use client";

import { useQueryParam } from "@/hooks/use-query-param";
import {
  Users,
  Receipt,
  Cog,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSheetPayroll, useFounderKPIs } from "@/features/financeiro/hooks/use-finance";
import { OperationalIndicatorsSection } from "@/features/financeiro/components/sections/operational-indicators-section";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

// ── Main page ──────────────────────────────────────────────────────────────────

function OperacionalContent() {
  const [month, setMonthParam] = useQueryParam("month", getCurrentMonth());

  // Google Sheets payroll data
  const {
    data: payroll,
    isLoading: payrollLoading,
    isError: payrollError,
    refetch: refetchPayroll,
    isFetching,
  } = useSheetPayroll(month);

  // Founder KPIs for receita
  const { data: kpis } = useFounderKPIs();

  // Dashboard for operational section
  const {
    data: dashData,
    isLoading: dashLoading,
    error: dashError,
    refetch,
  } = useFounderDashboard({ preset: "ytd" });

  const isCurrentMonth = month === getCurrentMonth();
  const receitaPerColaborador =
    payroll && payroll.headcount > 0 && kpis
      ? kpis.receitaMTD / payroll.headcount
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Indicadores Operacionais</h1>
        <p className="text-sm text-muted-foreground">
          Equipe e custos via orçamento TBO (Google Sheets).
        </p>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMonthParam(shiftMonth(month, -1))}
          className="p-1.5 rounded-md hover:bg-gray-100 transition"
          title="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 capitalize min-w-[160px] text-center">
            {formatMonthLabel(month)}
          </span>
          {isCurrentMonth && (
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              Atual
            </Badge>
          )}
        </div>
        <button
          onClick={() => setMonthParam(shiftMonth(month, 1))}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <Users className="size-3.5 text-indigo-500" />
              Headcount
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payrollLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <p className="text-xl font-bold text-indigo-600">{payroll?.headcount ?? 0}</p>
                <p className="text-xs text-muted-foreground">colaboradores com salário</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <Receipt className="size-3.5 text-rose-500" />
              Folha de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payrollLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <p className="text-xl font-bold text-rose-600">{fmt(payroll?.totalFolha ?? 0)}</p>
                <p className="text-xs text-muted-foreground">salários totais</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <Cog className="size-3.5 text-slate-500" />
              Desp. Pessoas (seção)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payrollLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <p className="text-xl font-bold text-slate-600">{fmt(payroll?.totalDespesas ?? 0)}</p>
                <p className="text-xs text-muted-foreground">subtotal planilha</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <DollarSign className="size-3.5 text-emerald-500" />
              Receita / Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payrollLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <p className="text-xl font-bold text-emerald-600">{fmt(receitaPerColaborador)}</p>
                <p className="text-xs text-muted-foreground">receita MTD / headcount</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Equipe & Folha — from Google Sheets */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Equipe & Folha</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {payroll?.headcount ?? 0} colaboradores
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => refetchPayroll()}
                disabled={isFetching}
                title="Atualizar dados da planilha"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payrollLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : payrollError ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-red-500">
              <Cog className="h-8 w-8" />
              <p className="text-sm font-medium">Erro ao carregar planilha</p>
              <p className="text-xs text-muted-foreground">
                Verifique se a planilha está compartilhada como &quot;qualquer pessoa com o link&quot;.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchPayroll()}>
                Tentar novamente
              </Button>
            </div>
          ) : !payroll?.members.length ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum colaborador encontrado</p>
              <p className="text-xs">Verifique a aba &quot;Fluxo de Caixa 2026&quot; na planilha.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Colaborador</th>
                    <th className="pb-2 font-medium">Cargo</th>
                    <th className="pb-2 font-medium">Área</th>
                    <th className="pb-2 font-medium text-right">Salário</th>
                    <th className="pb-2 font-medium text-right">% Folha</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.members
                    .filter((m) => m.salary > 0)
                    .sort((a, b) => b.salary - a.salary)
                    .map((m) => (
                      <tr key={m.name} className="border-b last:border-0">
                        <td className="py-2 font-medium">{m.name}</td>
                        <td className="py-2 text-muted-foreground">{m.role || "—"}</td>
                        <td className="py-2">
                          <Badge
                            variant="outline"
                            className={
                              m.section === "vendas"
                                ? "text-blue-700 border-blue-300 bg-blue-50"
                                : "text-indigo-700 border-indigo-300 bg-indigo-50"
                            }
                          >
                            {m.section === "vendas" ? "Vendas" : "Equipe"}
                          </Badge>
                        </td>
                        <td className="py-2 text-right text-rose-600 font-medium">
                          {fmt(m.salary)}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {payroll.totalFolha > 0
                            ? fmtPct((m.salary / payroll.totalFolha) * 100)
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="mt-3 pt-3 border-t flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Total Folha</span>
                <span className="text-rose-600">{fmt(payroll.totalFolha)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operational KPIs (churn, etc.) */}
      <OperationalIndicatorsSection
        d={dashData}
        isLoading={dashLoading}
        errMsg={dashError ? (dashError as Error).message : null}
        onRetry={refetch}
      />
    </div>
  );
}

export default function OperacionalPage() {
  return (
    <RBACGuard minRole="diretoria">
      <OperacionalContent />
    </RBACGuard>
  );
}
