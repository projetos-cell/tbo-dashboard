"use client";

import { useState } from "react";
import { IconAlertTriangle, IconPlayerPause, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useProject, useUpdateProject, useDeleteProject } from "@/features/projects/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SettingsDangerZoneProps {
  projectId: string;
}

export function SettingsDangerZone({ projectId }: SettingsDangerZoneProps) {
  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleArchive = () => {
    updateProject.mutate(
      { id: projectId, updates: { status: "parado" } },
      { onSuccess: () => toast({ title: "Projeto pausado" }) },
    );
  };

  const handleDeleteConfirm = () => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        toast({ title: "Projeto excluido" });
        router.push("/projetos");
      },
    });
  };

  return (
    <>
      <section className="space-y-3 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/10 p-4">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-4 text-red-500" />
          <h3 className="text-sm font-medium text-red-700 dark:text-red-400">Zona de perigo</h3>
        </div>
        <p className="text-xs text-red-600/80 dark:text-red-400/80">
          Acoes irreversiveis. Tenha cuidado.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={handleArchive}
            disabled={updateProject.isPending || project?.status === "parado"}
          >
            <IconPlayerPause className="size-3.5" />
            Pausar projeto
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => setDeleteOpen(true)}
          >
            <IconTrash className="size-3.5" />
            Excluir projeto
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir projeto"
        description={`Excluir "${project?.name}"? Esta acao nao pode ser desfeita e todas as tarefas serao removidas.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
