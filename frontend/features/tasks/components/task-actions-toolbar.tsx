"use client";

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
import { LikeButton } from "./like-button";
import { TaskDeleteDialog } from "./task-delete-dialog";
import { useTaskActions, ATTACH_ACCEPT } from "@/features/tasks/hooks/use-task-actions";
import type { Database } from "@/lib/supabase/types";

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
  const {
    confirmDelete,
    setConfirmDelete,
    duplicating,
    uploading,
    fileInputRef,
    isDeletePending,
    handleCopyLink,
    handleDuplicate,
    handleAttachFiles,
    handleMoveToProject,
    handleConvertToProject,
    handlePrint,
    handleDelete,
  } = useTaskActions({ task, onClose });

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
            <DropdownMenuItem onClick={handleDuplicate} disabled={duplicating}>
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
      <TaskDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        isPending={isDeletePending}
      />
    </>
  );
}
