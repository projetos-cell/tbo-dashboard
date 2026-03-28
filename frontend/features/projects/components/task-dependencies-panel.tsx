"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconArrowRight,
  IconLock,
  IconX,
  IconPlus,
  IconLink,
} from "@tabler/icons-react";
import {
  useTaskDependencies,
  useBlockingTasks,
  useAddTaskDependency,
  useRemoveTaskDependency,
} from "../hooks/use-task-advanced";
import type { TaskDependencyRow } from "../hooks/use-task-advanced";

const DEP_TYPE_LABELS: Record<TaskDependencyRow["dependency_type"], string> = {
  finish_to_start: "Termina → Inicia",
  start_to_start: "Inicia → Inicia",
  finish_to_finish: "Termina → Termina",
  start_to_finish: "Inicia → Termina",
};

const DEP_TYPE_COLORS: Record<TaskDependencyRow["dependency_type"], string> = {
  finish_to_start: "bg-blue-100 text-blue-700",
  start_to_start: "bg-green-100 text-green-700",
  finish_to_finish: "bg-purple-100 text-purple-700",
  start_to_finish: "bg-amber-100 text-amber-700",
};

interface TaskDependenciesPanelProps {
  taskId: string;
  projectId: string;
  projectTasks: Array<{ id: string; title: string; status?: string | null }>;
}

export function TaskDependenciesPanel({
  taskId,
  projectId,
  projectTasks,
}: TaskDependenciesPanelProps) {
  const { data: allDeps, isLoading } = useTaskDependencies(projectId);
  const { data: blockingTasks } = useBlockingTasks(taskId);
  const addDep = useAddTaskDependency();
  const removeDep = useRemoveTaskDependency();

  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedType, setSelectedType] = useState<TaskDependencyRow["dependency_type"]>("finish_to_start");

  // Deps where this task is the dependent (predecessors)
  const predecessors = (allDeps ?? []).filter((d) => d.task_id === taskId);
  // Deps where this task is depended upon (successors)
  const successors = (allDeps ?? []).filter((d) => d.depends_on_id === taskId);

  const taskMap = new Map(projectTasks.map((t) => [t.id, t]));

  const handleAdd = () => {
    if (!selectedTask || selectedTask === taskId) return;
    addDep.mutate(
      { task_id: taskId, depends_on_id: selectedTask, dependency_type: selectedType },
      {
        onSuccess: () => {
          setSelectedTask("");
        },
      },
    );
  };

  const availableTasks = projectTasks.filter(
    (t) =>
      t.id !== taskId &&
      !predecessors.some((d) => d.depends_on_id === t.id),
  );

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <IconLink size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Dependências</h3>
      </div>

      {/* Blocking warning */}
      {blockingTasks && blockingTasks.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-amber-700">
            <IconLock size={14} />
            <span className="text-xs font-medium">
              Esta tarefa está bloqueada por {blockingTasks.length} tarefa(s)
            </span>
          </div>
          <ul className="mt-1 space-y-1">
            {blockingTasks.map((b) => {
              const bt = b as typeof b & { blocking_task: { id: string; title: string; status: string | null } };
              return (
                <li key={b.id} className="text-xs text-amber-600">
                  • {bt.blocking_task?.title ?? b.depends_on_id}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Predecessors */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Predecessoras ({predecessors.length})
        </p>
        {predecessors.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Nenhuma predecessora</p>
        ) : (
          <ul className="space-y-2">
            {predecessors.map((dep) => {
              const task = taskMap.get(dep.depends_on_id);
              return (
                <li
                  key={dep.id}
                  className="flex items-center justify-between gap-2 rounded-md border bg-card p-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <IconArrowRight size={12} className="shrink-0 text-muted-foreground" />
                    <span className="text-xs truncate">{task?.title ?? dep.depends_on_id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${DEP_TYPE_COLORS[dep.dependency_type]}`}
                    >
                      {DEP_TYPE_LABELS[dep.dependency_type]}
                    </span>
                    {dep.lag_days > 0 && (
                      <span className="text-[10px] text-muted-foreground">+{dep.lag_days}d</span>
                    )}
                    <button
                      onClick={() => removeDep.mutate(dep.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remover dependência"
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Successors */}
      {successors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Bloqueando ({successors.length})
          </p>
          <ul className="space-y-2">
            {successors.map((dep) => {
              const task = taskMap.get(dep.task_id);
              return (
                <li
                  key={dep.id}
                  className="flex items-center gap-2 rounded-md border bg-muted/40 p-2"
                >
                  <IconLock size={12} className="shrink-0 text-muted-foreground" />
                  <span className="text-xs truncate text-muted-foreground">
                    {task?.title ?? dep.task_id}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Add dependency */}
      <div className="space-y-2 rounded-md border border-dashed p-3">
        <p className="text-xs font-medium text-muted-foreground">Adicionar predecessora</p>
        <div className="flex gap-2">
          <Select value={selectedTask} onValueChange={setSelectedTask}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue placeholder="Selecionar tarefa..." />
            </SelectTrigger>
            <SelectContent>
              {availableTasks.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedType}
            onValueChange={(v) => setSelectedType(v as TaskDependencyRow["dependency_type"])}
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEP_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-full text-xs"
          onClick={handleAdd}
          disabled={!selectedTask || addDep.isPending}
        >
          <IconPlus size={12} className="mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
