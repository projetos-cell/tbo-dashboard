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
} from "@dnd-kit/sortable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DemandPropertySection } from "./demand-property-section";
import { buildPropertyMap, CORE_KEYS, SCHEDULE_KEYS, DETAIL_KEYS } from "./demand-sidebar-properties";
import { useSectionOrder } from "../hooks/use-section-order";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];
type DemandUpdate = Database["public"]["Tables"]["demands"]["Update"];

interface DemandDetailSidebarProps {
  demand: DemandRow;
  onUpdate: (updates: DemandUpdate) => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

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
  const overdue = !!(demand.due_date && !isDone && demand.due_date < new Date().toISOString().split("T")[0]);

  const propertyMap = buildPropertyMap(demand, onUpdate, overdue);

  const handleDragEnd = (section: ReturnType<typeof useSectionOrder>) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      section.reorder(active.id as string, over.id as string);
    }
  };

  const renderSection = (section: ReturnType<typeof useSectionOrder>) => (
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
      <DemandPropertySection title="Core" collapsible={false}>
        {renderSection(core)}
      </DemandPropertySection>

      <Separator />

      <DemandPropertySection title="Cronograma">
        {renderSection(schedule)}
      </DemandPropertySection>

      <Separator />

      <DemandPropertySection title="Detalhes">
        {renderSection(detail)}
      </DemandPropertySection>

      <Separator />

      <DemandPropertySection title="Meta" defaultOpen={false}>
        {demand.notion_url && (
          <a
            href={demand.notion_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
          >
            <IconExternalLink className="size-3 shrink-0" />
            Abrir no Notion
          </a>
        )}

        <div className="text-[11px] text-muted-foreground space-y-0.5 px-1 py-1">
          {demand.created_at && (
            <p>Criada {format(new Date(demand.created_at), "dd MMM yyyy", { locale: ptBR })}</p>
          )}
          {demand.updated_at && (
            <p>Atualizada {format(new Date(demand.updated_at), "dd MMM yyyy", { locale: ptBR })}</p>
          )}
        </div>

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
              <IconTrash className="size-3 mr-1" />
              Excluir
            </Button>
          )}
        </div>
      </DemandPropertySection>
    </div>
  );
}
