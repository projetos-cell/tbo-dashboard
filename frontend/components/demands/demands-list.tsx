"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import {
  DEMAND_STATUS,
  DEMAND_PRIORITY,
  BU_COLORS,
} from "@/lib/constants";
import { useUpdateDemand, useDeleteDemand } from "@/hooks/use-demands";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  Circle,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useMemo, useCallback } from "react";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const TABLE_ID = "demandas";

interface DemandsListProps {
  demands: DemandRow[];
  onSelect: (demand: DemandRow) => void;
}

export function DemandsList({ demands, onSelect }: DemandsListProps) {
  const updateDemand = useUpdateDemand();
  const deleteDemand = useDeleteDemand();
  const { columnPrefs, sortPref, saveColumns, saveSort, reset } = useTablePreferences(TABLE_ID);

  const handleStatusChange = useCallback(
    (demandId: string, status: string) => {
      const feito = status === "Concluído" || status === "Concluido";
      updateDemand.mutate({ id: demandId, updates: { status, feito } });
    },
    [updateDemand]
  );

  const handlePriorityChange = useCallback(
    (demandId: string, prioridade: string) => {
      updateDemand.mutate({ id: demandId, updates: { prioridade } });
    },
    [updateDemand]
  );

  const handleDelete = useCallback(
    (demandId: string) => {
      deleteDemand.mutate(demandId);
    },
    [deleteDemand]
  );

  const columnDefs: ColumnDef<DemandRow>[] = useMemo(
    () => [
      {
        id: "check",
        label: "",
        width: "w-10",
        hideable: false,
        reorderable: false,
        cellRender: (row) => {
          const isDone =
            row.feito ||
            row.status === "Concluído" ||
            row.status === "Concluido";
          return (
            <div className="h-6 w-6 flex items-center justify-center">
              {isDone ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          );
        },
      },
      {
        id: "title",
        label: "Titulo",
        hideable: false,
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.title,
        cellRender: (row) => {
          const isDone =
            row.feito ||
            row.status === "Concluído" ||
            row.status === "Concluido";
          return (
            <div className="flex items-center gap-2 min-w-0">
              <span className={`truncate ${isDone ? "line-through opacity-60" : ""}`}>
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
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        label: "Status",
        responsive: "md" as const,
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.status,
        cellRender: (row) => {
          const statusCfg = DEMAND_STATUS[row.status];
          return statusCfg ? (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </Badge>
          ) : null;
        },
      },
      {
        id: "priority",
        label: "Prioridade",
        responsive: "md" as const,
        cellRender: (row) => {
          const priCfg = row.prioridade
            ? DEMAND_PRIORITY[row.prioridade.toLowerCase()]
            : null;
          return priCfg ? (
            <span className="text-xs font-medium" style={{ color: priCfg.color }}>
              {priCfg.label}
            </span>
          ) : null;
        },
      },
      {
        id: "responsible",
        label: "Responsavel",
        responsive: "lg" as const,
        cellRender: (row) => (
          <span className="text-sm text-muted-foreground">
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
          const isDone =
            row.feito ||
            row.status === "Concluído" ||
            row.status === "Concluido";
          const overdue =
            row.due_date && !isDone &&
            row.due_date < new Date().toISOString().split("T")[0];
          return row.due_date ? (
            <span
              className={`text-sm ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}
            >
              {format(new Date(row.due_date + "T12:00:00"), "dd MMM yyyy", {
                locale: ptBR,
              })}
            </span>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(row);
                  }}
                >
                  Abrir detalhes
                </DropdownMenuItem>
                {row.notion_url && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(row.notion_url!, "_blank");
                    }}
                  >
                    <ExternalLink className="size-3.5 mr-2" />
                    Abrir no Notion
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {Object.entries(DEMAND_STATUS)
                  .filter(([key]) => key !== "Concluido")
                  .map(([key, cfg]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(row.id, key);
                      }}
                    >
                      <span
                        className="size-2 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      />
                      {cfg.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
                {Object.entries(DEMAND_PRIORITY).map(([key, cfg]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityChange(row.id, key);
                    }}
                  >
                    <span
                      className="size-2 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    {cfg.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row.id);
                }}
              >
                <Trash2 className="size-3.5 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleStatusChange, handlePriorityChange, handleDelete, onSelect]
  );

  return (
    <DataTable
      tableId={TABLE_ID}
      columnDefs={columnDefs}
      data={demands}
      rowKey={(row) => row.id}
      savedPrefs={columnPrefs}
      onPrefsChange={saveColumns}
      onPrefsReset={reset}
      defaultSort={sortPref}
      onSortChange={saveSort}
      onRowClick={onSelect}
      emptyMessage="Nenhuma demanda encontrada"
    />
  );
}
