"use client";

import { useQueryParam } from "@/hooks/use-query-param";
import {
  IconUsers,
  IconReceipt,
  IconSettings,
  IconCurrencyDollar,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconRefresh,
} from "@tabler/icons-react";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useTeamPayroll,
  useUpsertTeamPayroll,
  useUpdateTeamPayroll,
  useDeleteTeamPayroll,
  useDuplicateMonthPayroll,
} from "@/features/financeiro/hooks/use-team-payroll";
import { PayrollTable } from "@/features/financeiro/components/payroll-table";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";
import { toast } from "sonner";

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

  const {
    data: payroll,
    isLoading: payrollLoading,
    isError: payrollError,
    refetch: refetchPayroll,
    isFetching,
  } = useTeamPayroll(month);

  const upsertMut = useUpsertTeamPayroll();
  const updateMut = useUpdateTeamPayroll(month);
  const deleteMut = useDeleteTeamPayroll(month);
  const duplicateMut = useDuplicateMonthPayroll();

  const { data: dashData, isLoading: dashLoading } = useFounderDashboard({ preset: "ytd" });

  const isCurrentMonth = month === getCurrentMonth();
  const anyLoading = payrollLoading || dashLoading;

  // Derived KPIs
  const headcount = payroll?.headcount ?? 0;
  const folha = payroll?.totalFolha ?? 0;
  const receitaRealizada = dashData?.receitaRealizada ?? 0;
  const receitaPerColab = headcount > 0 ? receitaRealizada / headcount : 0;
  const totalDespOmie = dashData ? dashData.folhaPagamento + dashData.custosOperacionais : 0;
  const custosOp = Math.max(0, totalDespOmie - folha);

  function handleDuplicatePreviousMonth() {
    const prev = shiftMonth(month, -1);
    duplicateMut.mutate(
      { sourceMonth: prev, targetMonth: month },
      {
        onSuccess: (data) => toast.success(`${data.length} registros copiados de ${formatMonthLabel(prev)}`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Month selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operacional</h1>
          <p className="text-sm text-muted-foreground">Equipe, folha e indicadores.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthParam(shiftMonth(month, -1))}>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold capitalize min-w-[140px] text-center">
              {formatMonthLabel(month)}
            </span>
            {isCurrentMonth && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                Atual
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthParam(shiftMonth(month, 1))} disabled={isCurrentMonth}>
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI cards — single row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiSummaryCard
          icon={<IconUsers className="size-3.5 text-indigo-500" />}
          label="Headcount"
          value={String(headcount)}
          sub="colaboradores ativos"
          color="text-indigo-600 dark:text-indigo-400"
          loading={payrollLoading}
        />
        <KpiSummaryCard
          icon={<IconReceipt className="size-3.5 text-rose-500" />}
          label="Folha"
          value={fmt(folha)}
          sub="salarios totais"
          color="text-rose-600 dark:text-rose-400"
          loading={payrollLoading}
        />
        <KpiSummaryCard
          icon={<IconCurrencyDollar className="size-3.5 text-emerald-500" />}
          label="Receita / Colab"
          value={fmt(receitaPerColab)}
          sub={`receita YTD / ${headcount} pessoas`}
          color="text-emerald-600 dark:text-emerald-400"
          loading={anyLoading}
        />
        <KpiSummaryCard
          icon={<IconSettings className="size-3.5 text-slate-500" />}
          label="Custos Operacionais"
          value={fmt(custosOp)}
          sub={custosOp + folha > 0 ? `${fmtPct((custosOp / (custosOp + folha)) * 100)} do total` : "sem dados"}
          color="text-slate-600 dark:text-slate-400"
          loading={anyLoading}
        />
      </div>

      {/* Equipe & Folha */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Equipe & Folha</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {headcount} colaboradores
              </Badge>
              {payroll && payroll.entries.length === 0 && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleDuplicatePreviousMonth} disabled={duplicateMut.isPending}>
                  <IconCopy className="h-3.5 w-3.5 mr-1" />
                  Copiar mes anterior
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetchPayroll()} disabled={isFetching} title="Atualizar">
                <IconRefresh className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
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
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-destructive">
              <IconSettings className="h-8 w-8" />
              <p className="text-sm font-medium">Erro ao carregar dados</p>
              <p className="text-xs text-muted-foreground">Verifique sua conexao e tente novamente.</p>
              <Button variant="outline" size="sm" onClick={() => refetchPayroll()}>Tentar novamente</Button>
            </div>
          ) : !payroll?.entries.length ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <IconUsers className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum colaborador neste mes</p>
              <p className="text-xs">Adicione manualmente ou copie do mes anterior.</p>
              <Button variant="outline" size="sm" onClick={handleDuplicatePreviousMonth} disabled={duplicateMut.isPending}>
                <IconCopy className="h-3.5 w-3.5 mr-1" />
                Copiar mes anterior
              </Button>
            </div>
          ) : (
            <PayrollTable
              entries={payroll.entries}
              totalFolha={payroll.totalFolha}
              month={month}
              onUpdate={(id, updates) =>
                updateMut.mutate(
                  { id, updates },
                  {
                    onSuccess: () => toast.success("Registro atualizado"),
                    onError: (err) => toast.error(`Erro ao atualizar: ${err.message}`),
                  },
                )
              }
              onDelete={(id) =>
                deleteMut.mutate(id, {
                  onSuccess: () => toast.success("Colaborador removido"),
                  onError: (err) => toast.error(`Erro ao remover: ${err.message}`),
                })
              }
              onAdd={(entry) =>
                upsertMut.mutate(entry, {
                  onSuccess: () => toast.success("Colaborador adicionado"),
                  onError: (err) => toast.error(`Erro ao adicionar: ${err.message}`),
                })
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── KPI Card (inline) ────────────────────────────────────────────────────────

function KpiSummaryCard({ icon, label, value, sub, color, loading }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function OperacionalPage() {
  return (
    <RBACGuard minRole="diretoria">
      <OperacionalContent />
    </RBACGuard>
  );
}
