"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProjectCard } from "./project-card";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { useUpdateProject } from "@/hooks/use-projects";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectBoardProps {
  projects: Project[];
}

function SortableCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard project={project} />
    </div>
  );
}

export function ProjectBoard({ projects }: ProjectBoardProps) {
  const updateProject = useUpdateProject();
  const [localProjects, setLocalProjects] = useState(projects);

  // Update when props change
  if (projects !== localProjects && !updateProject.isPending) {
    setLocalProjects(projects);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns = Object.entries(PROJECT_STATUS) as [
    ProjectStatusKey,
    (typeof PROJECT_STATUS)[ProjectStatusKey]
  ][];

  const getProjectsByStatus = useCallback(
    (status: string) => localProjects.filter((p) => p.status === status),
    [localProjects]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as string;

    const project = localProjects.find((p) => p.id === projectId);
    if (!project || project.status === newStatus) return;

    // Optimistic update
    setLocalProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );

    // Persist to Supabase
    updateProject.mutate({
      id: projectId,
      updates: { status: newStatus },
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(([statusKey, statusConfig]) => {
          const statusProjects = getProjectsByStatus(statusKey);
          return (
            <div
              key={statusKey}
              className="flex min-w-[280px] max-w-[320px] flex-1 flex-col"
            >
              {/* Column header */}
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: statusConfig.color }}
                />
                <h3 className="text-sm font-medium">{statusConfig.label}</h3>
                <span className="text-xs text-muted-foreground">
                  {statusProjects.length}
                </span>
              </div>

              {/* Column body — droppable */}
              <SortableContext
                id={statusKey}
                items={statusProjects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-[100px]">
                  {statusProjects.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      Nenhum projeto
                    </p>
                  ) : (
                    statusProjects.map((project) => (
                      <SortableCard key={project.id} project={project} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
