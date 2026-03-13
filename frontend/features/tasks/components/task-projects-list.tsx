"use client";

import { useState } from "react";
import Link from "next/link";
import { IconFolder, IconX, IconPlus } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTaskProjects, useRemoveTaskFromProject } from "@/features/tasks/hooks/use-task-projects";
import { TaskProjectPicker } from "./task-project-picker";

// ─── Types ────────────────────────────────────────────

interface TaskProjectsListProps {
  taskId: string;
  /** Controlled: se true, mantém o picker aberto (atalho Tab+P) */
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────

export function TaskProjectsList({
  taskId,
  pickerOpen,
  onPickerOpenChange,
}: TaskProjectsListProps) {
  const { data: taskProjects = [], isLoading } = useTaskProjects(taskId);
  const removeProject = useRemoveTaskFromProject(taskId);

  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const isLastProject = taskProjects.length === 1;

  function handleRemoveRequest(projectId: string) {
    if (isLastProject) {
      setPendingRemove(projectId);
    } else {
      removeProject.mutate(projectId);
    }
  }

  function confirmRemoveLast() {
    if (pendingRemove) {
      removeProject.mutate(pendingRemove);
      setPendingRemove(null);
    }
  }

  if (isLoading) {
    return (
      <span className="text-sm text-muted-foreground">Carregando...</span>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1 w-full">
        {/* Project list */}
        {taskProjects.map((tp) => {
          const p = tp.project;
          return (
            <div
              key={tp.project_id}
              className="group flex items-center gap-1.5 text-sm"
            >
              <IconFolder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Link
                href={`/projects/${p.id}`}
                className="flex-1 truncate hover:underline text-foreground"
              >
                {p.name}
              </Link>
              <button
                type="button"
                onClick={() => handleRemoveRequest(tp.project_id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                aria-label={`Remover ${p.name}`}
              >
                <IconX className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        {/* Feedback count */}
        {taskProjects.length > 1 && (
          <span className="text-[11px] text-muted-foreground">
            Tarefa existe em {taskProjects.length} projetos
          </span>
        )}

        {/* Add button / picker */}
        <TaskProjectPicker
          taskId={taskId}
          linkedProjectIds={taskProjects.map((tp) => tp.project_id)}
          totalLinked={taskProjects.length}
          open={pickerOpen}
          onOpenChange={onPickerOpenChange}
          trigger={
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5 w-fit"
            >
              <IconPlus className="h-3 w-3" />
              Adicionar a projetos
            </button>
          }
        />
      </div>

      {/* Confirmation dialog — last project */}
      <AlertDialog
        open={!!pendingRemove}
        onOpenChange={(open) => !open && setPendingRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover último projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta tarefa ficará sem projeto associado. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveLast}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
