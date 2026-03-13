"use client";

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  useTaskDetail,
  useTaskDetailTags,
} from "@/features/tasks/hooks/use-task-detail";
import { useTaskAssignees } from "@/features/tasks/hooks/use-task-assignees";
import { TaskDetailHeader } from "./task-detail-header";
import { TaskTitleInline } from "./task-title-inline";
import { TaskDetailFields } from "./task-detail-fields";
import { TaskDetailDescription } from "./task-detail-description";
import { TaskDetailSidebar } from "./task-detail-sidebar";

// ─── Props ──────────────────────────────────────────

interface TaskDetailSheetProps {
  taskId: string | undefined;
  open: boolean;
  onClose: () => void;
  projectName?: string;
}

// ─── Skeleton ───────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="px-6 py-4 space-y-4 animate-in fade-in duration-200">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-0 pb-2">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-1">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
      {/* Title */}
      <Skeleton className="h-8 w-3/4" />
      {/* Fields */}
      <div className="space-y-3 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      {/* Description */}
      <Skeleton className="h-20 w-full mt-4" />
      {/* Footer */}
      <div className="flex items-center gap-2 pt-4">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────

export function TaskDetailSheet({
  taskId,
  open,
  onClose,
  projectName,
}: TaskDetailSheetProps) {
  const { data: task, isLoading } = useTaskDetail(taskId);
  const { data: tags } = useTaskDetailTags(taskId);
  const { data: assigneesRaw } = useTaskAssignees(taskId || "");

  // Tab+P shortcut → abrir picker de projetos
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        lastKeyRef.current = "Tab";
        return;
      }
      if (lastKeyRef.current === "Tab" && e.key === "p") {
        e.preventDefault();
        setProjectPickerOpen(true);
      }
      lastKeyRef.current = null;
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Tab") {
        // Reset after a short delay to allow Tab+P chord
        setTimeout(() => {
          if (lastKeyRef.current === "Tab") lastKeyRef.current = null;
        }, 300);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [open]);

  // Resolve project name (fallback for legacy single-project)
  const resolvedProjectName =
    projectName || (task?.project_id ? "Projeto vinculado" : null);

  // Map assignees for sidebar
  const assignees = (assigneesRaw || []).map((a) => ({
    user_id: a.user_id,
    full_name: (a as Record<string, unknown>).full_name as string | undefined,
  }));

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] overflow-y-auto p-0 flex flex-col"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes da tarefa</SheetTitle>
          <SheetDescription>Painel lateral com detalhes da tarefa</SheetDescription>
        </SheetHeader>

        {isLoading || !task ? (
          <DetailSkeleton />
        ) : (
          <>
            {/* Header: complete toggle + toolbar */}
            <TaskDetailHeader task={task} />

            {/* Main scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 pb-6 space-y-0">
                {/* Title (inline editable) */}
                <TaskTitleInline task={task} />

                {/* Property grid */}
                <TaskDetailFields
                  task={task}
                  tags={tags || []}
                  projectName={resolvedProjectName}
                  projectPickerOpen={projectPickerOpen}
                  onProjectPickerOpenChange={setProjectPickerOpen}
                />

                <Separator className="my-2" />

                {/* Description */}
                <TaskDetailDescription description={task.description} />
              </div>
            </div>

            {/* Footer: collaborators + metadata */}
            <TaskDetailSidebar task={task} assignees={assignees} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
