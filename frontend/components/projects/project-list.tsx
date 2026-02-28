"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteProject } from "@/hooks/use-projects";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";
import { useMemo, useCallback } from "react";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const TABLE_ID = "projetos";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const { prefs, save, reset } = useTablePreferences(TABLE_ID);

  const handleDelete = useCallback(
    (project: Project) => {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir "${project.name}"?`
      );
      if (!confirmed) return;
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
    },
    [deleteProject, toast]
  );

  const columnDefs: ColumnDef<Project>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Nome",
        hideable: false,
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
        cellRender: (row) => (
          <span className="text-muted-foreground">
            {row.construtora || "\u2014"}
          </span>
        ),
      },
      {
        id: "owner",
        label: "Responsavel",
        responsive: "lg" as const,
        cellRender: (row) => (
          <span className="text-muted-foreground">
            {row.owner_name || "\u2014"}
          </span>
        ),
      },
      {
        id: "due_date",
        label: "Prazo",
        responsive: "lg" as const,
        width: "w-[110px]",
        cellRender: (row) => (
          <span className="text-muted-foreground text-sm">
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
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
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
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            disabled={deleteProject.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [handleDelete, deleteProject.isPending]
  );

  return (
    <DataTable
      tableId={TABLE_ID}
      columnDefs={columnDefs}
      data={projects}
      rowKey={(row) => row.id}
      savedPrefs={prefs}
      onPrefsChange={save}
      onPrefsReset={reset}
      emptyMessage="Nenhum projeto encontrado."
    />
  );
}
