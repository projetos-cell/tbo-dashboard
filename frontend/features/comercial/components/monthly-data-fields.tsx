"use client";

import { Input } from "@/components/ui/input";
import {
  IconChartBar,
  IconTarget,
  IconUsers,
  IconPhone,
  IconMail,
  IconCurrencyDollar,
  IconBuildingStore,
  IconCalendar,
} from "@tabler/icons-react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface EditableField {
  key: string;
  label: string;
  unit: string;
  icon: typeof IconChartBar;
  type: "number" | "currency" | "text";
  color: string;
}

export const MONTHLY_FIELDS: EditableField[] = [
  {
    key: "reunioes_agendadas",
    label: "Total de reuniões agendadas no mês",
    unit: "reuniões",
    icon: IconCalendar,
    type: "number",
    color: "text-blue-500",
  },
  {
    key: "reunioes_realizadas",
    label: "Total de reuniões realizadas no mês",
    unit: "reuniões",
    icon: IconUsers,
    type: "number",
    color: "text-blue-500",
  },
  {
    key: "vendas_quantidade",
    label: "Total de vendas — quantidade",
    unit: "contratos",
    icon: IconTarget,
    type: "number",
    color: "text-green-500",
  },
  {
    key: "vendas_valor",
    label: "Total de vendas — valor monetário",
    unit: "R$",
    icon: IconCurrencyDollar,
    type: "currency",
    color: "text-green-500",
  },
  {
    key: "prospeccoes_outbound",
    label: "Prospecções frias (outbound)",
    unit: "contatos",
    icon: IconPhone,
    type: "number",
    color: "text-orange-500",
  },
  {
    key: "leads_inbound",
    label: "Leads inbound (orgânicos — conteúdo TBO e sócios)",
    unit: "leads",
    icon: IconMail,
    type: "number",
    color: "text-purple-500",
  },
  {
    key: "produtos_vendidos",
    label: "Produtos/empreendimentos vendidos no mês",
    unit: "",
    icon: IconBuildingStore,
    type: "text",
    color: "text-amber-500",
  },
];

// ── EditableRow ──────────────────────────────────────────────────────────────

export function EditableRow({
  index,
  field,
  value,
  onChange,
}: {
  index: number;
  field: EditableField;
  value: number | string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="group grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[11px] font-bold text-primary">
          {String(index).padStart(2, "0")}
        </span>
        <field.icon className={`h-4 w-4 shrink-0 ${field.color}`} />
      </div>
      <span className="text-sm truncate">{field.label}</span>
      <div className="flex items-center gap-1.5">
        <Input
          inputMode={field.type === "text" ? "text" : "decimal"}
          className="h-7 w-24 text-right text-sm font-medium tabular-nums"
          value={
            field.type === "currency" && typeof value === "number" && value > 0
              ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
              : value === 0
                ? ""
                : String(value)
          }
          placeholder={field.type === "currency" ? "0,00" : field.type === "number" ? "0" : ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.unit && (
          <span className="text-[11px] text-muted-foreground w-14 text-right whitespace-nowrap">
            {field.unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ── MonthlyDataForm (field list) ─────────────────────────────────────────────

export function MonthlyDataForm({
  values,
  onFieldChange,
}: {
  values: Record<string, number | string>;
  onFieldChange: (key: string, value: string, type: "number" | "currency" | "text") => void;
}) {
  return (
    <div className="space-y-2">
      {MONTHLY_FIELDS.map((field, idx) => (
        <EditableRow
          key={field.key}
          index={idx + 1}
          field={field}
          value={values[field.key] ?? (field.type === "text" ? "" : 0)}
          onChange={(val) => onFieldChange(field.key, val, field.type)}
        />
      ))}
    </div>
  );
}
