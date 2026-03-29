"use client";

import {
  IconDots,
  IconCopy,
  IconArchive,
  IconTrash,
  IconEdit,
  IconSettings,
  IconTemplate,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectActionsMenuProps {
  onEditDetails: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
  onArchive: () => void;
  onSettings: () => void;
  onDelete: () => void;
  onAskAi?: () => void;
  duplicating: boolean;
  savingTemplate: boolean;
  archiving: boolean;
}

export function ProjectActionsMenu({
  onEditDetails,
  onDuplicate,
  onSaveAsTemplate,
  onArchive,
  onSettings,
  onDelete,
  onAskAi,
  duplicating,
  savingTemplate,
  archiving,
}: ProjectActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          aria-label="Mais opções"
        >
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onEditDetails}>
          <IconEdit className="mr-2 size-3.5" />
          Editar detalhes
        </DropdownMenuItem>
        {onAskAi && (
          <DropdownMenuItem onClick={onAskAi}>
            <IconSparkles className="mr-2 size-3.5" />
            Ask AI
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDuplicate} disabled={duplicating}>
          <IconCopy className="mr-2 size-3.5" />
          Duplicar projeto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSaveAsTemplate} disabled={savingTemplate}>
          <IconTemplate className="mr-2 size-3.5" />
          Salvar como template
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive} disabled={archiving}>
          <IconArchive className="mr-2 size-3.5" />
          Pausar projeto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettings}>
          <IconSettings className="mr-2 size-3.5" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onDelete}
        >
          <IconTrash className="mr-2 size-3.5" />
          Excluir projeto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
