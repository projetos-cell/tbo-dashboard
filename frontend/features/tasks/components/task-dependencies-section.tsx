"use client";

import { useState } from "react";
import {
  IconGitBranch,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  useTaskDependencies,
  useAddDependency,
  useRemoveDependency,
} from "@/features/tasks/hooks/use-task-dependencies";
import { DependencyItem } from "./task-dependency-item";
import { AddDependencyButton } from "./task-dependency-add-button";
import type { TaskDependency, DependencyType } from "@/schemas/task-dependency";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskDependenciesSectionProps {
  task: TaskRow;
  /** Callback para abrir outra tarefa no sheet */
  onOpenTask?: (taskId: string) => void;
}

export function TaskDependenciesSection({
  task,
  onOpenTask,
}: TaskDependenciesSectionProps) {
  const { toast } = useToast();
  const { data: deps = [], isLoading } = useTaskDependencies(task.id);
  const addDependency = useAddDependency(task.id);
  const removeDependency = useRemoveDependency(task.id);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const predecessors = deps.filter((d) => d.successor_id === task.id);
  const successors = deps.filter((d) => d.predecessor_id === task.id);
  const isBlocked = predecessors.length > 0;

  const handleRemove = (depId: string) => {
    setRemovingId(depId);
    removeDependency.mutate(depId, {
      onSuccess: () => setRemovingId(null),
      onError: () => {
        setRemovingId(null);
        toast({ title: "Erro ao remover dependência", variant: "destructive" });
      },
    });
  };

  const handleAddPredecessor = (targetTaskId: string, type: DependencyType) => {
    addDependency.mutate(
      { predecessor_id: targetTaskId, successor_id: task.id, dependency_type: type },
      {
        onError: (err) => {
          toast({
            title: err instanceof Error ? err.message : "Erro ao adicionar dependência",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleAddSuccessor = (targetTaskId: string, type: DependencyType) => {
    addDependency.mutate(
      { predecessor_id: task.id, successor_id: targetTaskId, dependency_type: type },
      {
        onError: (err) => {
          toast({
            title: err instanceof Error ? err.message : "Erro ao adicionar dependência",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <IconLoader2 className="h-3 w-3 animate-spin" />
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Badge: Bloqueada */}
      {isBlocked && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium px-2 py-0.5">
              <IconAlertTriangle className="h-3 w-3" />
              Bloqueada
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Depende de {predecessors.length} tarefa
            {predecessors.length !== 1 ? "s" : ""} ainda não concluída
            {predecessors.length !== 1 ? "s" : ""}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Grupo: Bloqueada por */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <IconGitBranch className="h-3 w-3" />
          Bloqueada por
        </div>
        {predecessors.length === 0 ? (
          <p className="text-[11px] text-muted-foreground pl-4">Nenhuma</p>
        ) : (
          <div className="space-y-0.5 pl-1">
            {predecessors.map((dep: TaskDependency) => (
              <DependencyItem
                key={dep.id}
                depId={dep.id}
                linkedTaskId={dep.predecessor_id}
                onRemove={handleRemove}
                onOpenTask={onOpenTask}
                isRemoving={removingId === dep.id}
              />
            ))}
          </div>
        )}
        <div className="pl-1 pt-0.5">
          <AddDependencyButton
            taskId={task.id}
            projectId={task.project_id}
            asPredecessor={false}
            onAdd={handleAddPredecessor}
          />
        </div>
      </div>

      {/* Grupo: Bloqueia */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <IconGitBranch className="h-3 w-3 scale-x-[-1]" />
          Bloqueia
        </div>
        {successors.length === 0 ? (
          <p className="text-[11px] text-muted-foreground pl-4">Nenhuma</p>
        ) : (
          <div className="space-y-0.5 pl-1">
            {successors.map((dep: TaskDependency) => (
              <DependencyItem
                key={dep.id}
                depId={dep.id}
                linkedTaskId={dep.successor_id}
                onRemove={handleRemove}
                onOpenTask={onOpenTask}
                isRemoving={removingId === dep.id}
              />
            ))}
          </div>
        )}
        <div className="pl-1 pt-0.5">
          <AddDependencyButton
            taskId={task.id}
            projectId={task.project_id}
            asPredecessor={true}
            onAdd={handleAddSuccessor}
          />
        </div>
      </div>
    </div>
  );
}
