"use client";

import * as React from "react";
import {
  IconCircleDot,
  IconFlag,
  IconUser,
  IconBriefcase,
  IconCalendar,
  IconTag,
  IconMovie,
  IconFileText,
  IconTarget,
  IconStack2,
  IconFlagCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { InlineEditable } from "@/components/ui/inline-editable";
import { InlineSelect, type InlineSelectOption } from "@/components/ui/inline-select";
import { DemandPropertyRow } from "./demand-property-row";
import { DemandDatePicker } from "./demand-date-picker";
import { DemandTagInput } from "./demand-tag-input";
import { DEMAND_STATUS, DEMAND_PRIORITY, BU_COLORS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];
type DemandUpdate = Database["public"]["Tables"]["demands"]["Update"];

/* ── Option lists ────────────────────────────────────── */

export const statusOptions: InlineSelectOption[] = Object.entries(DEMAND_STATUS)
  .filter(([key]) => key !== "Concluido")
  .map(([key, cfg]) => ({
    value: key,
    label: cfg.label,
    color: cfg.color,
    bg: cfg.bg,
  }));

export const priorityOptions: InlineSelectOption[] = Object.entries(DEMAND_PRIORITY).map(
  ([key, cfg]) => ({
    value: key,
    label: cfg.label,
    color: cfg.color,
    bg: `${cfg.color}22`,
  }),
);

/* ── Section order keys ──────────────────────────────── */

export const CORE_KEYS = ["status", "prioridade", "responsavel", "bus"];
export const SCHEDULE_KEYS = ["start_date", "due_date", "due_date_end"];
export const DETAIL_KEYS = ["tags", "tipo_midia", "formalizacao", "item_principal", "subitem", "milestones"];

/* ── Property map builder ────────────────────────────── */

export function buildPropertyMap(
  demand: DemandRow,
  onUpdate: (updates: DemandUpdate) => void,
  overdue: boolean,
): Record<string, React.ReactNode> {
  return {
    status: (
      <DemandPropertyRow id="status" icon={IconCircleDot} label="Status">
        <InlineSelect
          value={demand.status}
          options={statusOptions}
          onSave={(v) => {
            const feito = v === "Concluído" || v === "Concluido";
            onUpdate({ status: v, feito });
          }}
        />
      </DemandPropertyRow>
    ),
    prioridade: (
      <DemandPropertyRow
        id="prioridade"
        icon={IconFlag}
        label="Prioridade"
        onClear={demand.prioridade ? () => onUpdate({ prioridade: null }) : undefined}
      >
        <InlineSelect
          value={demand.prioridade?.toLowerCase() ?? null}
          options={priorityOptions}
          onSave={(v) => onUpdate({ prioridade: v })}
          fallbackLabel="Sem prioridade"
        />
      </DemandPropertyRow>
    ),
    responsavel: (
      <DemandPropertyRow
        id="responsavel"
        icon={IconUser}
        label="Responsável"
        onClear={demand.responsible ? () => onUpdate({ responsible: null }) : undefined}
      >
        <InlineEditable
          value={demand.responsible || ""}
          onSave={(v) => onUpdate({ responsible: v || null })}
          variant="small"
          placeholder="Atribuir..."
        />
      </DemandPropertyRow>
    ),
    bus: (
      <DemandPropertyRow
        id="bus"
        icon={IconBriefcase}
        label="BUs"
        onClear={(demand.bus || []).length > 0 ? () => onUpdate({ bus: [] }) : undefined}
      >
        <div className="flex flex-wrap gap-0.5">
          {Object.entries(BU_COLORS).map(([bu, buColor]) => {
            const isActive = (demand.bus || []).includes(bu);
            return (
              <Badge
                key={bu}
                variant={isActive ? "secondary" : "outline"}
                className="cursor-pointer text-[10px] px-1.5 py-0 transition-all hover:ring-1 hover:ring-ring/30"
                style={isActive ? { backgroundColor: buColor.bg, color: buColor.color } : undefined}
                onClick={() => {
                  const current = demand.bus || [];
                  const next = current.includes(bu) ? current.filter((b) => b !== bu) : [...current, bu];
                  onUpdate({ bus: next });
                }}
              >
                {bu}
              </Badge>
            );
          })}
        </div>
      </DemandPropertyRow>
    ),
    start_date: (
      <DemandPropertyRow
        id="start_date"
        icon={IconCalendar}
        label="Início"
        onClear={demand.start_date ? () => onUpdate({ start_date: null }) : undefined}
      >
        <DemandDatePicker
          value={demand.start_date}
          onChange={(v) => onUpdate({ start_date: v })}
          placeholder="Definir..."
        />
      </DemandPropertyRow>
    ),
    due_date: (
      <DemandPropertyRow
        id="due_date"
        icon={IconCalendar}
        label="Prazo"
        onClear={demand.due_date ? () => onUpdate({ due_date: null }) : undefined}
      >
        <DemandDatePicker
          value={demand.due_date}
          onChange={(v) => onUpdate({ due_date: v })}
          placeholder="Definir..."
          overdue={overdue}
        />
      </DemandPropertyRow>
    ),
    due_date_end: (
      <DemandPropertyRow
        id="due_date_end"
        icon={IconCalendar}
        label="Entrega"
        onClear={demand.due_date_end ? () => onUpdate({ due_date_end: null }) : undefined}
      >
        <DemandDatePicker
          value={demand.due_date_end}
          onChange={(v) => onUpdate({ due_date_end: v })}
          placeholder="Definir..."
        />
      </DemandPropertyRow>
    ),
    tags: (
      <DemandPropertyRow
        id="tags"
        icon={IconTag}
        label="Tags"
        onClear={(demand.tags || []).length > 0 ? () => onUpdate({ tags: [] }) : undefined}
      >
        <DemandTagInput
          tags={demand.tags || []}
          onAdd={(tag) => onUpdate({ tags: [...(demand.tags || []), tag] })}
          onRemove={(tag) => onUpdate({ tags: (demand.tags || []).filter((t) => t !== tag) })}
          placeholder="+ tag"
        />
      </DemandPropertyRow>
    ),
    tipo_midia: (
      <DemandPropertyRow
        id="tipo_midia"
        icon={IconMovie}
        label="Tipo Mídia"
        onClear={(demand.tipo_midia || []).length > 0 ? () => onUpdate({ tipo_midia: [] }) : undefined}
      >
        <DemandTagInput
          tags={demand.tipo_midia || []}
          onAdd={(t) => onUpdate({ tipo_midia: [...(demand.tipo_midia || []), t] })}
          onRemove={(t) => onUpdate({ tipo_midia: (demand.tipo_midia || []).filter((x) => x !== t) })}
          placeholder="+ tipo"
        />
      </DemandPropertyRow>
    ),
    formalizacao: (
      <DemandPropertyRow
        id="formalizacao"
        icon={IconFileText}
        label="Formalização"
        onClear={demand.formalizacao ? () => onUpdate({ formalizacao: null }) : undefined}
      >
        <InlineEditable
          value={demand.formalizacao || ""}
          onSave={(v) => onUpdate({ formalizacao: v || null })}
          variant="small"
          placeholder="—"
        />
      </DemandPropertyRow>
    ),
    item_principal: (
      <DemandPropertyRow
        id="item_principal"
        icon={IconTarget}
        label="Item Principal"
        onClear={demand.item_principal ? () => onUpdate({ item_principal: null }) : undefined}
      >
        <InlineEditable
          value={demand.item_principal || ""}
          onSave={(v) => onUpdate({ item_principal: v || null })}
          variant="small"
          placeholder="—"
        />
      </DemandPropertyRow>
    ),
    subitem: (
      <DemandPropertyRow
        id="subitem"
        icon={IconStack2}
        label="Subitem"
        onClear={demand.subitem ? () => onUpdate({ subitem: null }) : undefined}
      >
        <InlineEditable
          value={demand.subitem || ""}
          onSave={(v) => onUpdate({ subitem: v || null })}
          variant="small"
          placeholder="—"
        />
      </DemandPropertyRow>
    ),
    milestones: (
      <DemandPropertyRow
        id="milestones"
        icon={IconFlagCheck}
        label="Milestones"
        onClear={demand.milestones ? () => onUpdate({ milestones: null }) : undefined}
      >
        <InlineEditable
          value={demand.milestones || ""}
          onSave={(v) => onUpdate({ milestones: v || null })}
          variant="small"
          placeholder="—"
        />
      </DemandPropertyRow>
    ),
  };
}
