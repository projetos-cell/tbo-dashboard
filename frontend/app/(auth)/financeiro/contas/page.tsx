"use client";

import { RBACGuard } from "@/components/rbac-guard";
import { useQueryParam } from "@/hooks/use-query-param";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";

const AgingChart = dynamic(
  () => import("@/features/financeiro/components/aging-chart").then((m) => ({ default: m.AgingChart })),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-muted" /> }
);
import { useOverdueEntries, useFinanceAging } from "@/features/financeiro/hooks/use-finance";
import { Skeleton } from "@/components/ui/skeleton";
import { fmt } from "@/features/financeiro/lib/formatters";
import {
  IconAlertCircle,
  IconCalendarClock,
  IconClock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContasSummaryCards } from "@/features/financeiro/components/contas-summary-cards";
import { EntryTable } from "@/features/financeiro/components/contas-entry-table";

// ── Main Content ──────────────────────────────────────────────────────────────

function ContasContent() {
  const [tabRaw, setTab] = useQueryParam("tipo", "all");
  const tab = (["all", "ar", "ap"].includes(tabRaw) ? tabRaw : "all") as "all" | "ar" | "ap";
  const { data: aging } = useFinanceAging();
  const { data, isLoading, isError, refetch } = useOverdueEntries(tab);

  const projectedAR = data?.projectedEntries.filter((e) => e.type === "receita") ?? [];
  const projectedAP = data?.projectedEntries.filter((e) => e.type === "despesa") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Contas a Pagar / Receber
        </h1>
        <p className="text-sm text-muted-foreground">
          Inadimplência, projeção de recebíveis e despesas pendentes.
        </p>
      </div>

      <ContasSummaryCards aging={aging} />

      {/* Aging chart */}
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
            <IconAlertCircle className="size-4 text-red-500" />
            Títulos Vencidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "ar" | "ap")}>
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
                  <IconAlertCircle className="h-6 w-6" />
                  <p className="text-sm">Erro ao carregar títulos vencidos</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : !data?.entries.length ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                  <IconClock className="h-8 w-8" />
                  <p className="text-sm font-medium">Nenhum título vencido</p>
                  <p className="text-xs">Todos os títulos estão em dia nesta categoria.</p>
                </div>
              ) : (
                <>
                  <EntryTable entries={data.entries} isProjected={false} />
                  <div className="mt-4 flex gap-6 text-sm font-medium border-t pt-3">
                    {(tab === "all" || tab === "ar") && (
                      <span className="text-emerald-600">
                        Total AR: {fmt(data.totalAr)} ({data.totalArCount} títulos)
                      </span>
                    )}
                    {(tab === "all" || tab === "ap") && (
                      <span className="text-red-600">
                        Total AP: {fmt(data.totalAp)} ({data.totalApCount} títulos)
                      </span>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Projected AR */}
      {(tab === "all" || tab === "ar") && projectedAR.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconCalendarClock className="size-4 text-blue-500" />
              A Receber — Próximos 12 meses
              <Badge variant="secondary" className="text-xs ml-2">
                {projectedAR.length} título{projectedAR.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EntryTable entries={projectedAR} isProjected={true} />
          </CardContent>
        </Card>
      )}

      {/* Projected AP */}
      {(tab === "all" || tab === "ap") && projectedAP.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconCalendarClock className="size-4 text-orange-500" />
              A Pagar — Próximos 12 meses
              <Badge variant="secondary" className="text-xs ml-2">
                {projectedAP.length} título{projectedAP.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EntryTable entries={projectedAP} isProjected={true} />
          </CardContent>
        </Card>
      )}

      {/* Empty state: projected AR */}
      {(tab === "all" || tab === "ar") && projectedAR.length === 0 && !isLoading && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconCalendarClock className="size-4 text-blue-500" />
              A Receber — Próximos 12 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <IconCalendarClock className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum recebível projetado</p>
              <p className="text-xs">Não há títulos a receber nos próximos 12 meses.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ContasPage() {
  return (
    <RBACGuard minRole="admin">
      <ContasContent />
    </RBACGuard>
  );
}
