"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CircleDot,
  Flag,
  User,
  Briefcase,
  CalendarIcon,
  Tag,
  Film,
  FileText,
  Target,
  Layers,
  Milestone,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InlineEditable } from "@/components/ui/inline-editable";
import { InlineSelect, type InlineSelectOption } from "@/components/ui/inline-select";
import { DemandPropertyRow } from "./demand-property-row";
import { DemandPropertySection } from "./demand-property-section";
import { DemandDatePicker } from "./demand-date-picker";
import { DemandTagInput } from "./demand-tag-input";
import {
  DEMAND_STATUS,
  DEMAND_PRIORITY,
  BU_COLORS,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];
type DemandUpdate = Database["public"]["Tables"]["demands"]["Update"];

interface DemandDetailSidebarProps {
  demand: DemandRow;
  onUpdate: (updates: DemandUpdate) => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

/* ── Option lists ────────────────────────────────────── */

const statusOptions: InlineSelectOption[] = Object.entries(DEMAND_STATUS)
  .filter(([key]) => key !== "Concluido")
  .map(([key, cfg]) => ({
    value: key,
    label: cfg.label,
    color: cfg.color,
    bg: cfg.bg,
  }));

const priorityOptions: InlineSelectOption[] = Object.entries(DEMAND_PRIORITY).map(
  ([key, cfg]) => ({
    value: key,
    label: cfg.label,
    color: cfg.color,
    bg: `${cfg.color}22`,
  }),
);

/* ── Section order keys ──────────────────────────────── */

const CORE_KEYS = ["status", "prioridade", "responsavel", "bus"];
const SCHEDULE_KEYS = ["start_date", "due_date", "due_date_end"];
const DETAIL_KEYS = ["tags", "tipo_midia", "formalizacao", "item_principal", "subitem", "milestones"];

function useSectionOrder(storageKey: string, defaultKeys: string[]) {
  const [order, setOrder] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return defaultKeys;
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return defaultKeys;
      const parsed = JSON.parse(saved) as string[];
      const merged = parsed.filter((k) => defaultKeys.includes(k));
      const missing = defaultKeys.filter((k) => !merged.includes(k));
      return [...merged, ...missing];
    } catch {
      return defaultKeys;
    }
  });

  const reorder = React.useCallback(
    (activeId: string, overId: string) => {
      setOrder((prev) => {
        const oldIndex = prev.indexOf(activeId);
        const newIndex = prev.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* noop */ }
        return next;
      });
    },
    [storageKey],
  );

  return { order, reorder };
}

/* ── Main component ──────────────────────────────────── */

export function DemandDetailSidebar({
  demand,
  onUpdate,
  onDelete,
  isDeleting = false,
}: DemandDetailSidebarProps) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const core = useSectionOrder("demand-sidebar-core", CORE_KEYS);
  const schedule = useSectionOrder("demand-sidebar-schedule", SCHEDULE_KEYS);
  const detail = useSectionOrder("demand-sidebar-detail", DETAIL_KEYS);

  const isDone = demand.feito || demand.status === "Concluído" || demand.status === "Concluido";
  const overdue = demand.due_date && !isDone && demand.due_date < new Date().toISOString().split("T")[0];

  const handleDragEnd = (section: ReturnType<typeof useSectionOrder>) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      section.reorder(active.id as string, over.id as string);
    }
  };

  /* ── Property renderers ─────────────────────────────── */

  const propertyMap: Record<string, React.ReactNode> = {
    status: (
      <DemandPropertyRow id="status" icon={CircleDot} label="Status">
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
        icon={Flag}
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
        icon={User}
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
        icon={Briefcase}
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
        icon={CalendarIcon}
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
        icon={CalendarIcon}
        label="Prazo"
        onClear={demand.due_date ? () => onUpdate({ due_date: null }) : undefined}
      >
        <DemandDatePicker
          value={demand.due_date}
          onChange={(v) => onUpdate({ due_date: v })}
          placeholder="Definir..."
          overdue={!!overdue}
        />
      </DemandPropertyRow>
    ),
    due_date_end: (
      <DemandPropertyRow
        id="due_date_end"
        icon={CalendarIcon}
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
        icon={Tag}
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
        icon={Film}
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
        icon={FileText}
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
        icon={Target}
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
        icon={Layers}
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
        icon={Milestone}
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

  const renderSection = (
    section: ReturnType<typeof useSectionOrder>,
  ) => (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd(section)}>
      <SortableContext items={section.order} strategy={verticalListSortingStrategy}>
        {section.order.map((key) => (
          <React.Fragment key={key}>{propertyMap[key]}</React.Fragment>
        ))}
      </SortableContext>
    </DndContext>
  );

  return (
    <div className="w-[240px] shrink-0 px-4 py-4 space-y-3 text-sm overflow-y-auto">
      {/* Core — always open */}
      <DemandPropertySection title="Core" collapsible={false}>
        {renderSection(core)}
      </DemandPropertySection>

      <Separator />

      {/* Schedule */}
      <DemandPropertySection title="Cronograma">
        {renderSection(schedule)}
      </DemandPropertySection>

      <Separator />

      {/* Details */}
      <DemandPropertySection title="Detalhes">
        {renderSection(detail)}
      </DemandPropertySection>

      <Separator />

      {/* Meta — collapsed by default */}
      <DemandPropertySection title="Meta" defaultOpen={false}>
        {/* Notion link */}
        {demand.notion_url && (
          <a
            href={demand.notion_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
          >
            <ExternalLink className="size-3 shrink-0" />
            Abrir no Notion
          </a>
        )}

        {/* Timestamps */}
        <div className="text-[11px] text-muted-foreground space-y-0.5 px-1 py-1">
          {demand.created_at && (
            <p>Criada {format(new Date(demand.created_at), "dd MMM yyyy", { locale: ptBR })}</p>
          )}
          {demand.updated_at && (
            <p>Atualizada {format(new Date(demand.updated_at), "dd MMM yyyy", { locale: ptBR })}</p>
          )}
        </div>

        {/* Delete */}
        <div className="pt-1">
          {confirmDelete ? (
            <div className="space-y-1.5">
              <p className="text-xs text-destructive">Excluir demanda?</p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 text-xs"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3 mr-1" />
              Excluir
            </Button>
          )}
        </div>
      </DemandPropertySection>
    </div>
  );
}
