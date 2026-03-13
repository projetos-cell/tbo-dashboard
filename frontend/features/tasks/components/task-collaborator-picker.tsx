"use client";

import { type ReactNode } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTeamMembers } from "@/hooks/use-team";
import {
  useTaskCollaborators,
  useAddCollaborator,
  useRemoveCollaborator,
} from "@/features/tasks/hooks/use-task-collaborators";

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

interface TaskCollaboratorPickerProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
}

export function TaskCollaboratorPicker({
  taskId,
  open,
  onOpenChange,
  trigger,
}: TaskCollaboratorPickerProps) {
  const { data: members = [], isLoading } = useTeamMembers({ is_active: true });
  const { data: collaborators = [] } = useTaskCollaborators(taskId);
  const addCollaborator = useAddCollaborator();
  const removeCollaborator = useRemoveCollaborator();

  const collaboratorIds = new Set(collaborators.map((c) => c.user_id));

  function handleToggle(memberId: string) {
    if (collaboratorIds.has(memberId)) {
      removeCollaborator.mutate({ taskId, userId: memberId });
    } else {
      addCollaborator.mutate({ taskId, userId: memberId });
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start" sideOffset={6}>
        <Command>
          <CommandInput placeholder="Buscar membro..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Carregando..." : "Nenhum membro encontrado"}
            </CommandEmpty>

            <CommandGroup heading="Membros da equipe">
              {members.map((member) => {
                const isCollab = collaboratorIds.has(member.id);
                return (
                  <CommandItem
                    key={member.id}
                    value={member.full_name}
                    onSelect={() => handleToggle(member.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Avatar className="h-6 w-6 shrink-0">
                      {member.avatar_url && (
                        <AvatarImage
                          src={member.avatar_url}
                          alt={member.full_name}
                        />
                      )}
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {getInitials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">
                        {member.full_name}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 shrink-0 font-normal"
                    >
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>

                    {isCollab && (
                      <IconCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
