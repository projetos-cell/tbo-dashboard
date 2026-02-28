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
  DELIVERABLE_STATUS,
  DELIVERABLE_TYPES,
} from "@/lib/constants";
import { useUpdateDeliverable, useDeleteDeliverable } from "@/hooks/use-entregas";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useMemo, useCallback } from "react";

type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];

const TABLE_ID = "entregas";

interface EntregasListProps {
  deliverables: DeliverableRow[];
  onSelect: (deliverable: DeliverableRow) => void;
}

export function EntregasList({ deliverables, onSelect }: EntregasListProps) {
  const updateDeliverable = useUpdateDeliverable();
  const deleteDeliverable = useDeleteDeliverable();
  const { prefs, save, reset } = useTablePreferences(TABLE_ID);

  const handleStatusChange = useCallback(
    (id: string, status: string) => {
      updateDeliverable.mutate({ id, updates: { status } });
    },
    [updateDeliverable]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteDeliverable.mutate(id);
    },
    [deleteDeliverable]
  );

  const columnDefs: ColumnDef<DeliverableRow>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Nome",
        hideable: false,
        cellRender: (row) => (
          <span className="font-medium">{row.name}</span>
        ),
      },
      {
        id: "project",
        label: "Projeto",
        responsive: "md" as const,
        cellRender: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.project_name ?? "\u2014"}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        responsive: "md" as const,
        cellRender: (row) => {
          const statusCfg =
            DELIVERABLE_STATUS[row.status as keyof typeof DELIVERABLE_STATUS];
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
        id: "type",
        label: "Tipo",
        responsive: "lg" as const,
        cellRender: (row) => {
          const typeCfg = row.type ? DELIVERABLE_TYPES[row.type] : null;
          return typeCfg ? (
            <span className="text-xs font-medium" style={{ color: typeCfg.color }}>
              {typeCfg.label}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{"\u2014"}</span>
          );
        },
      },
      {
        id: "version",
        label: "Versao",
        responsive: "lg" as const,
        cellRender: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.current_version ?? "\u2014"}
          </span>
        ),
      },
      {
        id: "owner",
        label: "Responsavel",
        responsive: "lg" as const,
        cellRender: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.owner_name ?? "\u2014"}
          </span>
        ),
      },
      {
        id: "reviewer",
        label: "Revisor",
        responsive: "xl" as const,
        cellRender: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.reviewer_id ?? "\u2014"}
          </span>
        ),
      },
      {
        id: "date",
        label: "Data",
        responsive: "xl" as const,
        cellRender: (row) =>
          row.created_at ? (
            <span className="text-sm text-muted-foreground">
              {format(new Date(row.created_at), "dd MMM yyyy", { locale: ptBR })}
            </span>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          ),
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
                  Ver detalhes
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {Object.entries(DELIVERABLE_STATUS).map(([key, cfg]) => (
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
    [handleStatusChange, handleDelete, onSelect]
  );

  return (
    <DataTable
      tableId={TABLE_ID}
      columnDefs={columnDefs}
      data={deliverables}
      rowKey={(row) => row.id}
      savedPrefs={prefs}
      onPrefsChange={save}
      onPrefsReset={reset}
      onRowClick={onSelect}
      emptyMessage="Nenhuma entrega encontrada"
    />
  );
}
