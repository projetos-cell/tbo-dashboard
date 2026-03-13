"use client";

import { useState } from "react";
import {
  IconGitBranch,
  IconX,
  IconPlus,
  IconExternalLink,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import { TaskDependencyPicker } from "./task-dependency-picker";
import { TASK_STATUS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTaskById } from "@/features/tasks/services/tasks";
import type { TaskDependency, DependencyType } from "@/schemas/task-dependency";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Helpers ──────────────────────────────────────────

function useTaskTitle(taskId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["task-title", taskId],
    queryFn: () => getTaskById(supabase, taskId),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Sub-components ────────────────────────────────────

interface DepItemProps {
  depId: string;
  linkedTaskId: string;
  onRemove: (depId: string) => void;
  onOpenTask?: (taskId: string) => void;
  isRemoving: boolean;
}

function DependencyItem({
  depId,
  linkedTaskId,
  onRemove,
  onOpenTask,
  isRemoving,
}: DepItemProps) {
  const { data: linkedTask } = useTaskTitle(linkedTaskId);
  const statusCfg = linkedTask
    ? TASK_STATUS[linkedTask.status as keyof typeof TASK_STATUS]
    : null;

  return (
    <div className="group flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/60 transition-colors">
      {/* Status badge */}
      {statusCfg && (
        <span
          className="inline-flex shrink-0 h-2 w-2 rounded-full"
          style={{ backgroundColor: statusCfg.color }}
          title={statusCfg.label}
        />
      )}

      {/* Task title */}
      <button
        type="button"
        className="flex-1 text-left text-xs text-foreground hover:text-primary truncate transition-colors"
        onClick={() => onOpenTask?.(linkedTaskId)}
        disabled={!onOpenTask}
      >
        {linkedTask?.title ?? (
          <span className="text-muted-foreground italic">Carregando...</span>
        )}
      </button>

      {/* Status label */}
      {statusCfg && (
        <span
          className="text-[10px] px-1.5 py-px rounded-full text-white shrink-0"
          style={{ backgroundColor: statusCfg.color }}
        >
          {statusCfg.label}
        </span>
      )}

      {/* Open task button */}
      {onOpenTask && (
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Abrir tarefa"
          onClick={() => onOpenTask(linkedTaskId)}
        >
          <IconExternalLink className="h-3 w-3" />
        </Button>
      )}

      {/* Remove button */}
      <Button
        size="icon"
        variant="ghost"
        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
        aria-label="Remover dependência"
        onClick={() => onRemove(depId)}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <IconLoader2 className="h-3 w-3 animate-spin" />
        ) : (
          <IconX className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}

// ─── Add Button ────────────────────────────────────────

interface AddDepButtonProps {
  taskId: string;
  projectId?: string | null;
  /** true = esta tarefa é a predecessor; false = esta tarefa é a successor */
  asPredecessor: boolean;
  onAdd: (targetTaskId: string, type: DependencyType) => void;
}

function AddDependencyButton({
  taskId,
  projectId,
  asPredecessor,
  onAdd,
}: AddDepButtonProps) {
  return (
    <TaskDependencyPicker
      currentTaskId={taskId}
      defaultProjectId={projectId}
      onSelect={onAdd}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-0.5"
        title={asPredecessor ? "Esta tarefa bloqueará a selecionada" : "Selecionada bloqueará esta tarefa"}
      >
        <IconPlus className="h-3 w-3" />
        {asPredecessor ? "Adicionar tarefa bloqueada" : "Adicionar bloqueador"}
      </button>
    </TaskDependencyPicker>
  );
}

// ─── Main Section ──────────────────────────────────────

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

  // Split: predecessoras (bloqueiam esta tarefa) e sucessoras (esta tarefa bloqueia)
  const predecessors = deps.filter((d) => d.successor_id === task.id);
  const successors = deps.filter((d) => d.predecessor_id === task.id);

  // Blocked = tem predecessoras com tasks ainda não concluídas (verificado via status)
  const isBlocked = predecessors.length > 0;

  const handleRemove = (depId: string) => {
    setRemovingId(depId);
    removeDependency.mutate(depId, {
      onSuccess: () => setRemovingId(null),
      onError: () => {
        setRemovingId(null);
        toast({
          title: "Erro ao remover dependência",
          variant: "destructive",
        });
      },
    });
  };

  const handleAddPredecessor = (targetTaskId: string, type: DependencyType) => {
    // Predecessor → esta tarefa: predecessor_id = targetTaskId, successor_id = task.id
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
    // Esta tarefa → successor: predecessor_id = task.id, successor_id = targetTaskId
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
            Depende de {predecessors.length} tarefa{predecessors.length !== 1 ? "s" : ""} ainda não concluída{predecessors.length !== 1 ? "s" : ""}
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
