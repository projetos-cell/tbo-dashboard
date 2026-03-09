"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Users,
  Receipt,
  Cog,
  UserMinus,
  Target,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Save,
  StickyNote,
  Activity,
} from "lucide-react";
import { RBACGuard } from "@/components/rbac-guard";
import {
  useOperationalIndicators,
  useUpsertOperationalIndicator,
} from "@/features/financeiro/hooks/use-operational-indicators";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { OperationalIndicatorsSection } from "@/features/financeiro/components/sections/operational-indicators-section";
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

// ── Field definitions ──────────────────────────────────────────────────────────

interface FieldDef {
  key: keyof UpsertOperationalIndicatorInput;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  type: "integer" | "currency" | "percent";
  description: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "headcount",
    label: "Headcount",
    placeholder: "Ex: 15",
    icon: <Users className="h-4 w-4 text-indigo-500" />,
    type: "integer",
    description: "Nº de colaboradores ativos neste mês",
  },
  {
    key: "folha_pagamento",
    label: "Folha de Pagamento",
    placeholder: "Ex: 85.000,00",
    icon: <Receipt className="h-4 w-4 text-rose-500" />,
    type: "currency",
    description: "Valor total da folha (salários + encargos)",
  },
  {
    key: "custos_fixos",
    label: "Custos Fixos",
    placeholder: "Ex: 25.000,00",
    icon: <Cog className="h-4 w-4 text-slate-500" />,
    type: "currency",
    description: "Aluguel, ferramentas, infra, etc.",
  },
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
  {
    key: "churn_clientes_perdidos",
    label: "Clientes Perdidos",
    placeholder: "Ex: 2",
    icon: <UserMinus className="h-4 w-4 text-red-500" />,
    type: "integer",
    description: "Nº de clientes que saíram neste mês",
  },
];

// ── InlineField ────────────────────────────────────────────────────────────────

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
    } else if (field.type === "percent") {
      parsed = parseFloat(rawValue.replace(",", "."));
      if (parsed !== null && isNaN(parsed)) parsed = null;
    } else {
      parsed = parseInt(rawValue, 10);
      if (isNaN(parsed)) parsed = null;
    }
    onChange(field.key, parsed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
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
            inputMode={field.type === "integer" ? "numeric" : "decimal"}
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

  const { data: indicators, isLoading } = useOperationalIndicators(month);
  const mutation = useUpsertOperationalIndicator();

  // Sync local state when data loads or month changes
  useEffect(() => {
    if (indicators) {
      const vals: typeof localValues = {};
      for (const f of FIELDS) {
        vals[f.key] = indicators[f.key as keyof typeof indicators] as number | null;
      }
      setLocalValues(vals);
      setNotes(indicators.notes ?? "");
      setDirty(false);
    } else if (!isLoading) {
      setLocalValues({});
      setNotes("");
      setDirty(false);
    }
  }, [indicators, isLoading]);

  // Dashboard data for the KPI section
  const { data: dashData, isLoading: dashLoading, error: dashError, refetch } =
    useFounderDashboard({ preset: "ytd" });

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
      headcount: localValues.headcount ?? null,
      folha_pagamento: localValues.folha_pagamento ?? null,
      custos_fixos: localValues.custos_fixos ?? null,
      meta_receita: localValues.meta_receita ?? null,
      meta_margem: localValues.meta_margem ?? null,
      churn_clientes_perdidos: localValues.churn_clientes_perdidos ?? null,
      notes: notes.trim() || null,
    };

    mutation.mutate(input, {
      onSuccess: () => {
        setDirty(false);
      },
    });
  }

  const isCurrentMonth = month === getCurrentMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Indicadores Operacionais</h1>
          <p className="text-sm text-muted-foreground">
            Preencha os indicadores manuais para complementar os dados do Omie.
          </p>
        </div>
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
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Atual
            </span>
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

      {/* Form card */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-tbo-orange" />
            <h2 className="text-sm font-semibold text-gray-900">Inputs Manuais</h2>
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

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : (
          <>
            <div>
              {FIELDS.map((field) => (
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
                placeholder="Contexto sobre os números deste mês..."
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
          <p className="mt-3 text-xs text-emerald-600">Indicadores salvos com sucesso.</p>
        )}
      </div>

      {/* KPIs Section (from Omie, with manual overrides) */}
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
