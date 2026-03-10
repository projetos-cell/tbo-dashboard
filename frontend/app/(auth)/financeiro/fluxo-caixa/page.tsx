"use client";

import { Suspense } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { useQueryParamNumber } from "@/hooks/use-query-param";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashflowProjectionChart, SaldoDiarioChart } from "@/features/financeiro/components/cashflow-chart";
import { useFinanceCashFlowProjection } from "@/features/financeiro/hooks/use-finance";
import { fmt } from "@/features/financeiro/lib/formatters";

function FluxoCaixaContent() {
  const [projDays, setProjDays] = useQueryParamNumber("proj", 30 as 30 | 60 | 90, [30, 60, 90] as const);
  const [histDays, setHistDays] = useQueryParamNumber("hist", 90 as 30 | 90 | 180, [30, 90, 180] as const);
  const { data: projData } = useFinanceCashFlowProjection(projDays);

  // Summary from projection data
  const totalIn = projData?.reduce((s, p) => s + p.inflow, 0) ?? 0;
  const totalOut = projData?.reduce((s, p) => s + p.outflow, 0) ?? 0;
  const netFlow = totalIn - totalOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <p className="text-sm text-muted-foreground">
          Projeção de entradas e saídas + histórico de saldo diário.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Entradas Previstas ({projDays}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-600">{fmt(totalIn)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Saídas Previstas ({projDays}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600">{fmt(totalOut)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Fluxo Líquido ({projDays}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${netFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt(netFlow)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projection chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold">Projeção de Caixa</CardTitle>
          <div className="flex gap-1">
            {([30, 60, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setProjDays(d)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  projDays === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <CashflowProjectionChart />
        </CardContent>
      </Card>

      {/* Historical balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold">Saldo Diário Histórico</CardTitle>
          <div className="flex gap-1">
            {([30, 90, 180] as const).map((d) => (
              <button
                key={d}
                onClick={() => setHistDays(d)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  histDays === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <SaldoDiarioChart days={histDays} />
        </CardContent>
      </Card>

      {/* Upcoming entries table */}
      {projData && projData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Movimentações Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium text-right">Entradas</th>
                    <th className="pb-2 font-medium text-right">Saídas</th>
                    <th className="pb-2 font-medium text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {projData
                    .filter((p) => p.inflow > 0 || p.outflow > 0)
                    .slice(0, 15)
                    .map((p, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{p.label}</td>
                        <td className="py-2 text-right text-emerald-600">
                          {p.inflow > 0 ? fmt(p.inflow) : "—"}
                        </td>
                        <td className="py-2 text-right text-red-600">
                          {p.outflow > 0 ? fmt(p.outflow) : "—"}
                        </td>
                        <td className={`py-2 text-right font-medium ${p.balance >= 0 ? "text-foreground" : "text-red-600"}`}>
                          {fmt(p.balance)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FluxoCaixaPage() {
  return (
    <RBACGuard minRole="diretoria">
      <FluxoCaixaContent />
    </RBACGuard>
  );
}
