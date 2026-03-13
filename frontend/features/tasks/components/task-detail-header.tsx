"use client";

import { useState } from "react";
import {
  IconAlertTriangle,
  IconLink,
  IconDots,
  IconPaperclip,
  IconTrash,
  IconCopy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { TASK_STATUS } from "@/lib/constants";
import { TaskStatusToggle } from "./task-status-toggle";
import { LikeButton } from "./like-button";
import { useTaskDependencies } from "@/features/tasks/hooks/use-task-dependencies";
import { useDeleteTask } from "@/features/tasks/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskDetailHeaderProps {
  task: TaskRow;
  onClose?: () => void;
}

export function TaskDetailHeader({ task, onClose }: TaskDetailHeaderProps) {
  const { toast } = useToast();
  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const { data: deps = [] } = useTaskDependencies(task.id);
  const deleteTask = useDeleteTask();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const predecessorCount = deps.filter((d) => d.successor_id === task.id).length;
  const isBlocked = predecessorCount > 0 && !task.is_completed;

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?task=${task.id}`;
    void navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copiado!" });
    });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setConfirmDelete(false);
        onClose?.();
        toast({ title: "Tarefa excluída" });
      },
      onError: () => {
        setConfirmDelete(false);
        toast({
          title: "Erro ao excluir tarefa",
          description: "Tente novamente.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <TaskStatusToggle task={task} />

          {statusCfg && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
          )}

          {isBlocked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium px-2 py-0.5 cursor-default">
                  <IconAlertTriangle className="h-3 w-3" />
                  Bloqueada
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Depende de {predecessorCount} tarefa{predecessorCount !== 1 ? "s" : ""} ainda não concluída{predecessorCount !== 1 ? "s" : ""}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <LikeButton targetType="task" targetId={task.id} />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                aria-label="Anexar"
                onClick={() =>
                  toast({
                    title: "Anexos em breve",
                    description: "Esta função estará disponível em breve.",
                  })
                }
              >
                <IconPaperclip className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Anexar arquivo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                aria-label="Copiar link"
                onClick={handleCopyLink}
              >
                <IconLink className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Copiar link</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Mais opções">
                <IconDots className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleCopyLink}>
                <IconCopy className="mr-2 h-3.5 w-3.5" />
                Copiar link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setConfirmDelete(true)}
              >
                <IconTrash className="mr-2 h-3.5 w-3.5" />
                Excluir tarefa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa e todos os seus dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
