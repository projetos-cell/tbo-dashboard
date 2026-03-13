"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useDeleteProject } from "@/features/projects/hooks/use-projects";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
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
    [deleteProject.isPending]
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
