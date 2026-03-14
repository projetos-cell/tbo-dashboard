"use client";

import { useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { DEMAND_STATUS, DEMAND_PRIORITY, BU_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconCheck,
  IconCircle,
  IconExternalLink,
} from "@tabler/icons-react";
import { DemandActionsMenu } from "../components/demand-actions-menu";
import { useUpdateDemand, useDeleteDemand } from "@/features/demands/hooks/use-demands";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];
const isDone = (row: DemandRow) =>
  row.feito || row.status === "Concluído" || row.status === "Concluido";

export function useDemandColumns(onSelect: (demand: DemandRow) => void) {
  const updateDemand = useUpdateDemand();
  const deleteDemand = useDeleteDemand();

  const handleStatusChange = useCallback((demandId: string, status: string) => {
    const feito = status === "Concluído" || status === "Concluido";
    updateDemand.mutate({ id: demandId, updates: { status, feito } });
  }, [updateDemand]);

  const handlePriorityChange = useCallback((demandId: string, prioridade: string) => {
    updateDemand.mutate({ id: demandId, updates: { prioridade } });
  }, [updateDemand]);

  const handleDelete = useCallback((demandId: string) => {
    deleteDemand.mutate(demandId);
  }, [deleteDemand]);

  const columnDefs: ColumnDef<DemandRow>[] = useMemo(
    () => [
      {
        id: "check",
        label: "",
        width: "w-10",
        hideable: false,
        reorderable: false,
        cellRender: (row) => (
          <div className="h-6 w-6 flex items-center justify-center">
            {isDone(row) ? (
              <IconCheck className="h-4 w-4 text-green-600" />
            ) : (
              <IconCircle className="h-4 w-4 text-gray-500" />
            )}
          </div>
        ),
      },
      {
        id: "title",
        label: "Titulo",
        hideable: false,
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.title,
        cellRender: (row) => (
          <div className="flex items-center gap-2 min-w-0">
            <span className={`truncate ${isDone(row) ? "line-through opacity-60" : ""}`}>
              {row.title}
            </span>
            {row.notion_url && (
              <a
                href={row.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              >
                <IconExternalLink className="h-3.5 w-3.5 text-gray-500 hover:text-gray-900" />
              </a>
            )}
          </div>
        ),
      },
      {
        id: "status",
        label: "Status",
        responsive: "md" as const,
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.status,
        cellRender: (row) => {
          const cfg = DEMAND_STATUS[row.status];
          return cfg ? (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </Badge>
          ) : null;
        },
      },
      {
        id: "priority",
        label: "Prioridade",
        responsive: "md" as const,
        cellRender: (row) => {
          const cfg = row.prioridade
            ? DEMAND_PRIORITY[row.prioridade.toLowerCase()]
            : null;
          return cfg ? (
            <span className="text-xs font-medium" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
          ) : null;
        },
      },
      {
        id: "responsible",
        label: "Responsavel",
        responsive: "lg" as const,
        cellRender: (row) => (
          <span className="text-sm text-gray-500">
            {row.responsible ?? "\u2014"}
          </span>
        ),
      },
      {
        id: "bu",
        label: "BU",
        responsive: "lg" as const,
        cellRender: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.bus?.map((bu) => {
              const buColor = BU_COLORS[bu];
              return (
                <Badge
                  key={bu}
                  variant="secondary"
                  className="text-[10px]"
                  style={
                    buColor
                      ? { backgroundColor: buColor.bg, color: buColor.color }
                      : undefined
                  }
                >
                  {bu}
                </Badge>
              );
            })}
          </div>
        ),
      },
      {
        id: "due_date",
        label: "Prazo",
        responsive: "lg" as const,
        sortable: true,
        sortType: "date",
        sortAccessor: (row) => row.due_date,
        cellRender: (row) => {
          const done = isDone(row);
          const overdue =
            row.due_date && !done &&
            row.due_date < new Date().toISOString().split("T")[0];
          return row.due_date ? (
            <span
              className={`text-sm ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}
            >
              {format(new Date(row.due_date + "T12:00:00"), "dd MMM yyyy", {
                locale: ptBR,
              })}
            </span>
          ) : (
            <span className="text-gray-500">{"\u2014"}</span>
          );
        },
      },
      {
        id: "actions",
        label: "",
        width: "w-10",
        hideable: false,
        reorderable: false,
        cellRender: (row) => (
          <DemandActionsMenu
            row={row}
            onSelect={onSelect}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [onSelect, handleStatusChange, handlePriorityChange, handleDelete]
  );

  return columnDefs;
}
