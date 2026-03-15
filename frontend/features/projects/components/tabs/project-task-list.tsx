"use client";

import { useState, useMemo } from "react";
import { IconChevronRight, IconListCheck } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  useProjectTasks,
  useProjectSections,
} from "@/features/projects/hooks/use-project-tasks";
import { ProjectTaskRow } from "./project-task-row";
import {
  ProjectTasksToolbar,
  type TaskListFilters,
} from "./project-tasks-toolbar";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectTaskListProps {
  projectId: string;
  onSelectTask: (taskId: string) => void;
  onAddTask: () => void;
}

export function ProjectTaskList({
  projectId,
  onSelectTask,
  onAddTask,
}: ProjectTaskListProps) {
  const { parents, subtasksMap, isLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const [filters, setFilters] = useState<TaskListFilters>({
    search: "",
    status: "all",
  });

  // Apply filters
  const filtered = useMemo(() => {
    return parents.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !(t.title || "").toLowerCase().includes(q) &&
          !(t.assignee_name || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [parents, filters]);

  // Group by section
  const grouped = useMemo(() => {
    const sectionList = sections ?? [];
    const sectionMap = new Map(sectionList.map((s) => [s.id, s]));
    const groups: { section: { id: string; title: string; color: string | null } | null; tasks: TaskRow[] }[] = [];
    const bySection = new Map<string | null, TaskRow[]>();

    for (const task of filtered) {
      const key = task.section_id ?? null;
      const list = bySection.get(key) ?? [];
      list.push(task);
      bySection.set(key, list);
    }

    // Ordered sections first
    for (const section of sectionList) {
      const tasks = bySection.get(section.id);
      if (tasks && tasks.length > 0) {
        groups.push({ section, tasks });
        bySection.delete(section.id);
      }
    }

    // Unsectioned tasks
    const unsectioned = bySection.get(null);
    if (unsectioned && unsectioned.length > 0) {
      groups.push({ section: null, tasks: unsectioned });
    }

    return groups;
  }, [filtered, sections]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProjectTasksToolbar
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={parents.length}
        filteredCount={filtered.length}
        onAddTask={onAddTask}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={IconListCheck}
          title="Nenhuma tarefa encontrada"
          description={
            parents.length === 0
              ? "Crie a primeira tarefa para começar."
              : "Ajuste os filtros para ver mais tarefas."
          }
          cta={
            parents.length === 0
              ? { label: "Nova Tarefa", onClick: onAddTask }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {grouped.map((group) => (
            <SectionGroup
              key={group.section?.id ?? "unsectioned"}
              section={group.section}
              tasks={group.tasks}
              subtasksMap={subtasksMap}
              onSelectTask={onSelectTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionGroup({
  section,
  tasks,
  subtasksMap,
  onSelectTask,
}: {
  section: { id: string; title: string; color: string | null } | null;
  tasks: TaskRow[];
  subtasksMap: Map<string, TaskRow[]>;
  onSelectTask: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        {section && (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: section.color ?? "#6b7280" }}
              />
              <span className="text-sm font-semibold">{section.title}</span>
              <span className="text-muted-foreground text-xs">({tasks.length})</span>
              <IconChevronRight
                className={cn(
                  "text-muted-foreground ml-auto h-4 w-4 transition-transform",
                  open && "rotate-90",
                )}
              />
            </button>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent>
          <CardContent className={cn("space-y-0.5", section ? "pt-0" : "pt-2")}>
            {tasks.map((task) => (
              <ProjectTaskRow
                key={task.id}
                task={task}
                subtasks={subtasksMap.get(task.id) ?? []}
                onSelect={onSelectTask}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
