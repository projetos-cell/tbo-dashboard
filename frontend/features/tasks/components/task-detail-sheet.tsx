"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTaskDetail } from "@/features/tasks/hooks/use-task-detail";
import { TaskDetailHeader } from "./task-detail-header";
import { TaskTitleInline } from "./task-title-inline";
import { TaskDetailFields } from "./task-detail-fields";
import { TaskDetailDescription } from "./task-detail-description";
import { TaskDetailSidebar } from "./task-detail-sidebar";
import { TaskSubtasksSection } from "./task-subtasks-section";
import { TaskDependenciesSection } from "./task-dependencies-section";
import { TaskAttachmentsSection } from "./task-attachments-section";
import { CommentThread } from "@/components/shared/comment-thread";
import { TaskHistoryTimeline } from "./task-history-timeline";
import { TaskComputedFields } from "./task-computed-fields";
import { useSubtasks } from "@/features/tasks/hooks/use-tasks";

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
      <div className="flex items-center justify-between px-0 pb-2">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-1">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <Skeleton className="h-20 w-full mt-4" />
      <div className="flex items-center gap-2 pt-4">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// ─── Inner panel (reusado para task raiz e subtarefas) ──────

interface TaskPanelProps {
  taskId: string;
  projectName?: string | null;
  onClose: () => void;
  onOpenTask: (taskId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

function TaskPanel({ taskId, projectName, onClose, onOpenTask, isFullscreen, onToggleFullscreen }: TaskPanelProps) {
  const { data: task, isLoading } = useTaskDetail(taskId);
  const { data: subtasks = [] } = useSubtasks(taskId);

  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
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
  }, []);

  const resolvedProjectName =
    projectName || (task?.project_id ? "Projeto vinculado" : null);

  if (isLoading || !task) return <DetailSkeleton />;

  return (
    <>
      <TaskDetailHeader
        task={task}
        onClose={onClose}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6 space-y-0">
          <TaskTitleInline task={task} />
          <TaskDetailFields
            task={task}
            projectName={resolvedProjectName}
            projectPickerOpen={projectPickerOpen}
            onProjectPickerOpenChange={setProjectPickerOpen}
          />
          <Separator className="my-2" />
          <TaskDetailDescription taskId={task.id} description={task.description} />
          <div className="pt-3 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Subtarefas
            </p>
            <TaskSubtasksSection task={task} onOpenTask={onOpenTask} />
          </div>

          <TaskComputedFields task={task} subtasks={subtasks} />

          <Separator className="my-4" />

          <div className="pb-1">
            <TaskDependenciesSection task={task} onOpenTask={onOpenTask} />
          </div>

          <Separator className="my-4" />

          <div className="pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Anexos
            </p>
            <TaskAttachmentsSection taskId={task.id} />
          </div>

          <Separator className="my-4" />

          <div className="pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Comentarios
            </p>
            <CommentThread taskId={task.id} />
          </div>

          <Separator className="my-4" />

          <div className="pb-4">
            <TaskHistoryTimeline taskId={task.id} />
          </div>
        </div>
      </div>
      <TaskDetailSidebar task={task} />
    </>
  );
}

// ─── Component ──────────────────────────────────────

export function TaskDetailSheet({
  taskId,
  open,
  onClose,
  projectName,
}: TaskDetailSheetProps) {
  // Navigation stack: [rootTaskId, subtaskId, ...]
  const [navStack, setNavStack] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync stack root when taskId changes
  useEffect(() => {
    if (taskId) setNavStack([taskId]);
  }, [taskId]);

  // Reset fullscreen when sheet closes
  useEffect(() => {
    if (!open) setIsFullscreen(false);
  }, [open]);

  // Reset stack when sheet closes
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleOpenTask = useCallback((id: string) => {
    setNavStack((prev) => [...prev, id]);
  }, []);

  const handleBack = useCallback(() => {
    setNavStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const currentTaskId = navStack[navStack.length - 1];
  const isNavigating = navStack.length > 1;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="right"
        className={
          isFullscreen
            ? "w-full sm:w-[85vw] sm:max-w-[85vw] overflow-y-auto p-0 flex flex-col transition-all duration-300"
            : "w-full sm:w-[480px] sm:max-w-[480px] overflow-y-auto p-0 flex flex-col transition-all duration-300"
        }
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes da tarefa</SheetTitle>
          <SheetDescription>Painel lateral com detalhes da tarefa</SheetDescription>
        </SheetHeader>

        {/* Back navigation bar */}
        {isNavigating && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={handleBack}
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Button>
          </div>
        )}

        {currentTaskId ? (
          <TaskPanel
            key={currentTaskId}
            taskId={currentTaskId}
            projectName={isNavigating ? null : projectName}
            onClose={handleClose}
            onOpenTask={handleOpenTask}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        ) : (
          <DetailSkeleton />
        )}
      </SheetContent>
    </Sheet>
  );
}
