"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconExternalLink, IconTrash, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useDeleteProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PROJECT_STATUS, PROJECT_PRIORITY, type ProjectStatusKey, type ProjectPriorityKey } from "@/lib/constants";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";
import { useMemo, useCallback, useState } from "react";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const TABLE_ID = "projetos";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const { columnPrefs, sortPref, saveColumns, saveSort, reset } = useTablePreferences(TABLE_ID);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return;
    const project = pendingDelete;
    setPendingDelete(null);
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast({
          title: "Excluido",
          description: `"${project.name}" foi removido.`,
        });
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Nao foi possivel excluir.",
          variant: "destructive",
        });
      },
    });
  }, [pendingDelete, deleteProject, toast]);

  const columnDefs: ColumnDef<Project>[] = useMemo(
    () => [
      {
        id: "code",
        label: "Código",
        width: "w-[90px]",
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.code,
        cellRender: (row) => (
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {row.code || "\u2014"}
          </span>
        ),
      },
      {
        id: "name",
        label: "Nome",
        hideable: false,
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.name,
        cellRender: (row) => (
          <Link
            href={`/projetos/${row.id}`}
            className="font-medium hover:underline"
          >
            {row.name}
          </Link>
        ),
      },
      {
        id: "status",
        label: "Status",
        width: "w-[130px]",
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.status,
        cellRender: (row) => {
          const status =
            PROJECT_STATUS[row.status as ProjectStatusKey];
          return status ? (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: status.bg,
                color: status.color,
              }}
            >
              {status.label}
            </Badge>
          ) : null;
        },
      },
      {
        id: "priority",
        label: "Prioridade",
        width: "w-[130px]",
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => {
          const key = row.priority as ProjectPriorityKey | null;
          return key && PROJECT_PRIORITY[key] ? String(PROJECT_PRIORITY[key].sort) : "9";
        },
        cellRender: (row) => {
          const key = row.priority as ProjectPriorityKey | null;
          const cfg = key ? PROJECT_PRIORITY[key] : null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {cfg ? (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer select-none gap-1.5 text-xs hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      />
                      {cfg.label}
                      <IconChevronDown className="size-3 opacity-50" />
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors">
                      —
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {Object.entries(PROJECT_PRIORITY).map(([k, c]) => (
                  <DropdownMenuItem
                    key={k}
                    onClick={() => {
                      updateProject.mutate({ id: row.id, updates: { priority: k } as never });
                    }}
                    className="gap-2"
                  >
                    <div
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.label}
                  </DropdownMenuItem>
                ))}
                {cfg && (
                  <DropdownMenuItem
                    onClick={() => {
                      updateProject.mutate({ id: row.id, updates: { priority: null } as never });
                    }}
                    className="text-muted-foreground"
                  >
                    Remover
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        id: "construtora",
        label: "Construtora",
        responsive: "md" as const,
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.construtora,
        cellRender: (row) => (
          <span className="text-gray-500">
            {row.construtora || "\u2014"}
          </span>
        ),
      },
      {
        id: "owner",
        label: "Responsavel",
        responsive: "lg" as const,
        cellRender: (row) => (
          <span className="text-gray-500">
            {row.owner_name || "\u2014"}
          </span>
        ),
      },
      {
        id: "due_date",
        label: "Prazo",
        responsive: "lg" as const,
        width: "w-[110px]",
        sortable: true,
        sortType: "date",
        sortAccessor: (row) => row.due_date_end,
        cellRender: (row) => (
          <span className="text-gray-500 text-sm">
            {row.due_date_end
              ? format(new Date(row.due_date_end), "dd MMM yyyy", {
                  locale: ptBR,
                })
              : "\u2014"}
          </span>
        ),
      },
      {
        id: "notion",
        label: "",
        width: "w-[40px]",
        hideable: false,
        reorderable: false,
        cellRender: (row) =>
          row.notion_url ? (
            <a
              href={row.notion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <IconExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null,
      },
      {
        id: "actions",
        label: "",
        width: "w-[40px]",
        hideable: false,
        reorderable: false,
        cellRender: (row) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(row);
            }}
            disabled={deleteProject.isPending}
            aria-label="Excluir projeto"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [deleteProject.isPending, updateProject]
  );

  return (
    <>
      <DataTable
        tableId={TABLE_ID}
        columnDefs={columnDefs}
        data={projects}
        rowKey={(row) => row.id}
        savedPrefs={columnPrefs ?? undefined}
        onPrefsChange={saveColumns}
        onPrefsReset={reset}
        defaultSort={sortPref}
        onSortChange={saveSort}
        emptyMessage="Nenhum projeto encontrado."
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Excluir projeto"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Esta acao nao pode ser desfeita.`
            : "Esta acao nao pode ser desfeita."
        }
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
