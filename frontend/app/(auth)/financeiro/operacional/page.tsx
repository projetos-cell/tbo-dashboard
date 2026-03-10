"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Users,
  Receipt,
  Cog,
  Target,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Save,
  StickyNote,
  DollarSign,
} from "lucide-react";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOperationalIndicators,
  useUpsertOperationalIndicator,
} from "@/features/financeiro/hooks/use-operational-indicators";
import { usePayrollBreakdown, useFounderKPIs } from "@/features/financeiro/hooks/use-finance";
import { OperationalIndicatorsSection } from "@/features/financeiro/components/sections/operational-indicators-section";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";
import type { UpsertOperationalIndicatorInput } from "@/features/financeiro/services/operational-indicators";

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

function getMonthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split("-").map(Number);
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

function parseBRL(raw: string): number | null {
  const cleaned = raw
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}[,.])/g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function fmtBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

// ── InlineField (for manual inputs) ──────────────────────────────────────────

interface FieldDef {
  key: keyof UpsertOperationalIndicatorInput;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  type: "currency" | "percent";
  description: string;
}

const MANUAL_FIELDS: FieldDef[] = [
  {
    key: "meta_receita",
    label: "Meta de Receita",
    placeholder: "Ex: 200.000,00",
    icon: <Target className="h-4 w-4 text-emerald-500" />,
    type: "currency",
    description: "Meta de receita para o mês",
  },
  {
    key: "meta_margem",
    label: "Meta de Margem (%)",
    placeholder: "Ex: 35",
    icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
    type: "percent",
    description: "Meta de margem líquida em percentual",
  },
];

interface InlineFieldProps {
  field: FieldDef;
  value: number | null | undefined;
  onChange: (key: keyof UpsertOperationalIndicatorInput, val: number | null) => void;
}

function InlineField({ field, value, onChange }: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [rawValue, setRawValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEdit() {
    if (value !== null && value !== undefined) {
      if (field.type === "currency") {
        setRawValue(
          value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        );
      } else {
        setRawValue(String(value));
      }
    } else {
      setRawValue("");
    }
    setEditing(true);
  }

  function commitEdit() {
    setEditing(false);
    if (rawValue.trim() === "") {
      onChange(field.key, null);
      return;
    }

    let parsed: number | null = null;
    if (field.type === "currency") {
      parsed = parseBRL(rawValue);
    } else {
      parsed = parseFloat(rawValue.replace(",", "."));
      if (parsed !== null && isNaN(parsed)) parsed = null;
    }
    onChange(field.key, parsed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    else if (e.key === "Escape") setEditing(false);
  }

  function displayValue(): string {
    if (value === null || value === undefined) return "—";
    if (field.type === "currency") return fmtBRL(value);
    if (field.type === "percent") return `${value}%`;
    return String(value);
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 group">
      <div className="shrink-0">{field.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{field.label}</p>
        <p className="text-xs text-gray-500">{field.description}</p>
      </div>
      <div className="w-40 shrink-0">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-right text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-tbo-orange/30 focus:border-tbo-orange transition"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="w-full text-right px-3 py-1.5 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 transition cursor-text group-hover:bg-gray-50"
          >
            {displayValue()}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function OperacionalContent() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [localValues, setLocalValues] = useState<
    Partial<Record<keyof UpsertOperationalIndicatorInput, number | null>>
  >({});
  const [notes, setNotes] = useState("");
  const [dirty, setDirty] = useState(false);

  const { from, to } = getMonthRange(month);

  // Auto-detected payroll data
  const { data: payroll, isLoading: payrollLoading } = usePayrollBreakdown(from, to);

  // Manual indicators (meta_receita, meta_margem)
  const { data: indicators, isLoading: indicatorsLoading } = useOperationalIndicators(month);
  const mutation = useUpsertOperationalIndicator();

  // Founder KPIs for receita
  const { data: kpis } = useFounderKPIs();

  // Dashboard for the operational section
  const { data: dashData, isLoading: dashLoading, error: dashError, refetch } =
    useFounderDashboard({ preset: "ytd" });

  // Sync manual fields when data loads
  useEffect(() => {
    if (indicators) {
      setLocalValues({
        meta_receita: indicators.meta_receita as number | null,
        meta_margem: indicators.meta_margem as number | null,
      });
      setNotes(indicators.notes ?? "");
      setDirty(false);
    } else if (!indicatorsLoading) {
      setLocalValues({});
      setNotes("");
      setDirty(false);
    }
  }, [indicators, indicatorsLoading]);

  const handleFieldChange = useCallback(
    (key: keyof UpsertOperationalIndicatorInput, val: number | null) => {
      setLocalValues((prev) => ({ ...prev, [key]: val }));
      setDirty(true);
    },
    [],
  );

  function handleSave() {
    const input: UpsertOperationalIndicatorInput = {
      month,
      headcount: null,
      folha_pagamento: null,
      custos_fixos: null,
      meta_receita: localValues.meta_receita ?? null,
      meta_margem: localValues.meta_margem ?? null,
      churn_clientes_perdidos: null,
      notes: notes.trim() || null,
    };

    mutation.mutate(input, {
      onSuccess: () => setDirty(false),
    });
  }

  const isCurrentMonth = month === getCurrentMonth();
  const receitaPerColaborador =
    payroll && payroll.headcount > 0 && kpis
      ? kpis.receitaMTD / payroll.headcount
      : 0;
  const totalCustos = (payroll?.totalFolha ?? 0) + (payroll?.totalOperacional ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Indicadores Operacionais</h1>
        <p className="text-sm text-muted-foreground">
          Equipe e custos detectados automaticamente via transações Omie.
        </p>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
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
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* KPI summary cards (all auto-detected) */}
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
                <p className="text-xs text-muted-foreground">colaboradores com pagamento</p>
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
                <p className="text-xs text-muted-foreground">
                  {totalCustos > 0 ? fmtPct(((payroll?.totalFolha ?? 0) / totalCustos) * 100) : "0%"} dos custos
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
              <Cog className="size-3.5 text-slate-500" />
              Custos Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payrollLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <p className="text-xl font-bold text-slate-600">{fmt(payroll?.totalOperacional ?? 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {totalCustos > 0 ? fmtPct(((payroll?.totalOperacional ?? 0) / totalCustos) * 100) : "0%"} dos custos
                </p>
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

      {/* Equipe & Folha — auto-detected table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Equipe & Folha (auto-detectado)</CardTitle>
            <Badge variant="outline" className="text-xs">
              {payroll?.vendors.length ?? 0} colaboradores
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {payrollLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !payroll?.vendors.length ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum pagamento de folha detectado</p>
              <p className="text-xs">Verifique se há transações com fornecedores da equipe no período.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Colaborador</th>
                    <th className="pb-2 font-medium text-right">Valor Pago</th>
                    <th className="pb-2 font-medium text-right">Pagamentos</th>
                    <th className="pb-2 font-medium text-right">% Folha</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.vendors.map((v) => (
                    <tr key={v.vendor} className="border-b last:border-0">
                      <td className="py-2 font-medium">{v.vendor}</td>
                      <td className="py-2 text-right text-rose-600">{fmt(v.total)}</td>
                      <td className="py-2 text-right text-muted-foreground">{v.count}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {payroll.totalFolha > 0
                          ? fmtPct((v.total / payroll.totalFolha) * 100)
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

      {/* Manual inputs — only metas */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-tbo-orange" />
              <CardTitle className="text-sm font-semibold">Metas Manuais</CardTitle>
              {indicators && (
                <span className="text-xs text-gray-400">
                  Atualizado em{" "}
                  {new Date(indicators.updated_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={!dirty || mutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-tbo-orange hover:bg-tbo-orange/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {indicatorsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : (
            <>
              <div>
                {MANUAL_FIELDS.map((field) => (
                  <InlineField
                    key={field.key}
                    field={field}
                    value={localValues[field.key]}
                    onChange={handleFieldChange}
                  />
                ))}
              </div>

              {/* Notes field */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-900">
                    Observações
                  </label>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Contexto sobre metas deste mês..."
                  rows={2}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-tbo-orange/20 transition resize-none"
                />
              </div>
            </>
          )}

          {mutation.isError && (
            <p className="mt-3 text-xs text-red-500">
              Erro ao salvar: {mutation.error.message}
            </p>
          )}
          {mutation.isSuccess && !dirty && (
            <p className="mt-3 text-xs text-emerald-600">Metas salvas com sucesso.</p>
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
