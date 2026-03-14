"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDeleteTask, useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useUploadAttachment } from "@/hooks/use-attachments";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

const MAX_ATTACH_SIZE = 25 * 1024 * 1024; // 25 MB

export const ATTACH_ACCEPT = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "application/x-zip-compressed",
  "text/plain", "text/csv",
].join(",");

interface UseTaskActionsOptions {
  task: TaskRow;
  onClose?: () => void;
}

export function useTaskActions({ task, onClose }: UseTaskActionsOptions) {
  const { toast } = useToast();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const uploadAttachment = useUploadAttachment();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Copy URL ───────────────────────────────────────
  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}?task=${task.id}`;
    void navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copiado!" });
    });
  }, [task.id, toast]);

  // ─── Keyboard shortcuts ─────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
        e.preventDefault();
        handleCopyLink();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setConfirmDelete(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopyLink]);

  // ─── Duplicate ──────────────────────────────────────
  const handleDuplicate = () => {
    setDuplicating(true);
    createTask.mutate(
      {
        tenant_id: task.tenant_id!,
        title: `${task.title} (cópia)`,
        status: task.status ?? "pendente",
        project_id: task.project_id,
        section_id: task.section_id,
        assignee_id: task.assignee_id,
        assignee_name: task.assignee_name,
        priority: task.priority,
        start_date: task.start_date,
        due_date: task.due_date,
        description: task.description,
        is_completed: false,
      },
      {
        onSuccess: () => {
          toast({ title: "Tarefa duplicada com sucesso!" });
          setDuplicating(false);
        },
        onError: () => {
          toast({
            title: "Erro ao duplicar tarefa",
            description: "Tente novamente.",
            variant: "destructive",
          });
          setDuplicating(false);
        },
      }
    );
  };

  // ─── Attach files ───────────────────────────────────
  const handleAttachFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploading(true);
      let successCount = 0;

      for (const file of Array.from(files)) {
        if (file.size > MAX_ATTACH_SIZE) {
          toast({
            title: `${file.name}: arquivo muito grande`,
            description: "Máximo 25 MB por arquivo.",
            variant: "destructive",
          });
          continue;
        }
        try {
          await uploadAttachment.mutateAsync({ file, taskId: task.id });
          successCount++;
        } catch {
          toast({
            title: `Erro ao enviar ${file.name}`,
            description: "Tente novamente.",
            variant: "destructive",
          });
        }
      }

      if (successCount > 0) {
        toast({
          title:
            successCount === 1
              ? "Arquivo anexado com sucesso!"
              : `${successCount} arquivos anexados!`,
        });
      }

      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [task.id, uploadAttachment, toast]
  );

  // ─── Move to project ────────────────────────────────
  const handleMoveToProject = () => {
    toast({
      title: "Mover para projeto",
      description: 'Use o campo "Projetos" no painel de detalhes (Tab+P).',
    });
  };

  // ─── Convert to project ─────────────────────────────
  const handleConvertToProject = () => {
    toast({
      title: "Converter em projeto",
      description: "Esta função estará disponível em breve.",
    });
  };

  // ─── Delete ─────────────────────────────────────────
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

  return {
    // state
    confirmDelete,
    setConfirmDelete,
    duplicating,
    uploading,
    fileInputRef,
    // derived
    isDeletePending: deleteTask.isPending,
    // handlers
    handleCopyLink,
    handleDuplicate,
    handleAttachFiles,
    handleMoveToProject,
    handleConvertToProject,
    handlePrint: () => window.print(),
    handleDelete,
  };
}
