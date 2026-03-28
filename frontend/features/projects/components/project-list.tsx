"use client";

import { Button } from "@/components/ui/button";
import { useDeleteProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Database } from "@/lib/supabase/types";
import { useMemo, useCallback, useState } from "react";
import { buildProjectColumns } from "./project-list-columns";

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
    deleteProject.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast({ title: "Projeto excluido com sucesso" });
        setPendingDelete(null);
      },
      onError: () => {
        toast({
          title: "Erro ao excluir projeto",
          description: "Tente novamente.",
          variant: "destructive",
        });
      },
    });
  }, [pendingDelete, deleteProject, toast]);

  const handleUpdatePriority = useCallback(
    (id: string, priority: string | null) => {
      updateProject.mutate({ id, updates: { priority } as never });
    },
    [updateProject]
  );

  const columnDefs = useMemo(
    () =>
      buildProjectColumns({
        onDelete: setPendingDelete,
        onUpdatePriority: handleUpdatePriority,
        isDeleting: deleteProject.isPending,
      }),
    [deleteProject.isPending, handleUpdatePriority]
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
