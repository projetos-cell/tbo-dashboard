"use client";

import { useState } from "react";
import { IconUsersPlus, IconX } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useTaskCollaborators,
  useRemoveCollaborator,
} from "@/features/tasks/hooks/use-task-collaborators";
import { TaskCollaboratorPicker } from "./task-collaborator-picker";

// ─── Constants ────────────────────────────────────────

const MAX_VISIBLE = 5;

// ─── Helpers ──────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  founder: "Founder",
  diretoria: "Diretoria",
  lider: "Líder",
  colaborador: "Colaborador",
};

// ─── Component ────────────────────────────────────────

interface TaskCollaboratorsListProps {
  taskId: string;
}

export function TaskCollaboratorsList({ taskId }: TaskCollaboratorsListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: collaborators = [] } = useTaskCollaborators(taskId);
  const removeCollaborator = useRemoveCollaborator();

  const visible = collaborators.slice(0, MAX_VISIBLE);
  const overflow = collaborators.length - MAX_VISIBLE;

  function handleRemove(userId: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeCollaborator.mutate({ taskId, userId });
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        {/* Avatar group */}
        <div className="flex items-center gap-0">
          {visible.map((collab) => (
            <Tooltip key={collab.user_id}>
              <TooltipTrigger asChild>
                <div className="relative group/collab -ml-1 first:ml-0">
                  <Avatar className="h-6 w-6 ring-2 ring-background cursor-default">
                    {collab.avatar_url && (
                      <AvatarImage
                        src={collab.avatar_url}
                        alt={collab.full_name}
                      />
                    )}
                    <AvatarFallback className="text-[9px] font-semibold bg-blue-100 text-blue-700">
                      {getInitials(collab.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Remove button on hover */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(collab.user_id, e)}
                    className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/collab:opacity-100 transition-opacity duration-150 hover:bg-destructive/90 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label={`Remover ${collab.full_name}`}
                  >
                    <IconX className="h-2 w-2" strokeWidth={3} />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{collab.full_name}</p>
                <p className="text-muted-foreground">
                  {ROLE_LABELS[collab.role] ?? collab.role}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Overflow badge */}
          {overflow > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="h-6 w-6 -ml-1 ring-2 ring-background rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground cursor-default">
                  +{overflow}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {overflow} colaborador{overflow > 1 ? "es" : ""} adicional
                {overflow > 1 ? "is" : ""}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Add button */}
        <TaskCollaboratorPicker
          taskId={taskId}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          trigger={
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="h-6 w-6 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Adicionar colaborador"
            >
              <IconUsersPlus className="h-3 w-3" />
            </button>
          }
        />
      </div>
    </TooltipProvider>
  );
}
