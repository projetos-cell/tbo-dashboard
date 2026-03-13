"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IconLink,
  IconMaximize,
  IconMinimize,
  IconPaperclip,
  IconDots,
  IconCopy,
  IconFolderSymlink,
  IconPrinter,
  IconTrash,
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
import { LikeButton } from "./like-button";
import { useDeleteTask, useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useUploadAttachment } from "@/hooks/use-attachments";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

const ATTACH_ACCEPT = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "application/x-zip-compressed",
  "text/plain", "text/csv",
].join(",");

const MAX_ATTACH_SIZE = 25 * 1024 * 1024; // 25 MB

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskActionsToolbarProps {
  task: TaskRow;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function TaskActionsToolbar({
  task,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
}: TaskActionsToolbarProps) {
  const { toast } = useToast();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAttachment = useUploadAttachment();

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
      // Ignore if focus is in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      // Cmd/Ctrl + Shift + C → copy URL
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
        e.preventDefault();
        handleCopyLink();
        return;
      }

      // Delete / Backspace → open delete dialog
      if (e.key === "Delete" || e.key === "Backspace") {
        // Only trigger if not in a form element
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

  // ─── Attach file ────────────────────────────────────
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
          title: successCount === 1
            ? "Arquivo anexado com sucesso!"
            : `${successCount} arquivos anexados!`,
        });
      }
      setUploading(false);
      // Reset input so the same file can be re-selected
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

  // ─── Print ──────────────────────────────────────────
  const handlePrint = () => {
    window.print();
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

  // ─── Render ─────────────────────────────────────────
  return (
    <>
      <div className="flex items-center gap-0.5">
        {/* Like */}
        <LikeButton targetType="task" targetId={task.id} />

        {/* Attach */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ATTACH_ACCEPT}
          className="hidden"
          onChange={(e) => void handleAttachFiles(e.target.files)}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Anexar arquivo"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconPaperclip className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Anexar arquivo
          </TooltipContent>
        </Tooltip>

        {/* Copy URL */}
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
          <TooltipContent side="bottom" className="text-xs">
            Copiar link <kbd className="ml-1 opacity-60 text-[10px]">⌘⇧C</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Fullscreen toggle */}
        {onToggleFullscreen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? (
                  <IconMinimize className="h-3.5 w-3.5" />
                ) : (
                  <IconMaximize className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Mais opções"
            >
              <IconDots className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              onClick={handleDuplicate}
              disabled={duplicating}
            >
              <IconCopy className="mr-2 h-3.5 w-3.5" />
              Duplicar tarefa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMoveToProject}>
              <IconFolderSymlink className="mr-2 h-3.5 w-3.5" />
              Mover para projeto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleConvertToProject}>
              <IconFolderSymlink className="mr-2 h-3.5 w-3.5 opacity-50" />
              Converter em projeto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <IconPrinter className="mr-2 h-3.5 w-3.5" />
              Imprimir
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

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa e todos os seus dados
              serão removidos permanentemente.
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
