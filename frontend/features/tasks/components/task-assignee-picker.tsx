"use client";

import { useState } from "react";
import { IconCheck, IconSelector, IconUserOff, IconUsers } from "@tabler/icons-react";
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
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/use-team";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useAddAssignee } from "@/features/tasks/hooks/use-task-assignees";
import type { Database } from "@/lib/supabase/types";

// ─── Types ────────────────────────────────────────────

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskAssigneePickerProps {
  task: TaskRow;
}

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

export function TaskAssigneePicker({ task }: TaskAssigneePickerProps) {
  const [open, setOpen] = useState(false);

  const { data: members, isLoading } = useTeamMembers({ is_active: true });
  const updateTask = useUpdateTask();
  const addAssignee = useAddAssignee();

  const currentAssigneeId = task.assignee_id;
  const currentAssigneeName = task.assignee_name;

  function handleSelect(memberId: string, memberName: string) {
    setOpen(false);

    updateTask.mutate(
      {
        id: task.id,
        updates: {
          assignee_id: memberId,
          assignee_name: memberName,
        },
        previousTask: task,
      },
      {
        onSuccess: () => {
          // Auto-add como colaborador (preparação F08)
          if (task.tenant_id) {
            addAssignee.mutate({
              task_id: task.id,
              user_id: memberId,
              tenant_id: task.tenant_id,
              role: "assignee",
            });
          }
        },
      }
    );
  }

  function handleRemove() {
    setOpen(false);

    updateTask.mutate({
      id: task.id,
      updates: {
        assignee_id: null,
        assignee_name: null,
      },
      previousTask: task,
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 text-sm rounded-md px-1.5 py-0.5 -mx-1.5",
            "hover:bg-accent/50 transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {currentAssigneeName ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px] font-semibold bg-blue-100 text-blue-700">
                  {getInitials(currentAssigneeName)}
                </AvatarFallback>
              </Avatar>
              <span>{currentAssigneeName}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sem responsável</span>
          )}
          <IconSelector className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Buscar membro..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Carregando..." : "Nenhum membro encontrado"}
            </CommandEmpty>

            {/* Remove option */}
            {currentAssigneeId && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleRemove}
                    className="text-muted-foreground"
                  >
                    <IconUserOff className="mr-2 h-4 w-4" />
                    Remover responsável
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Member list */}
            <CommandGroup heading="Membros">
              {(members ?? []).map((member) => {
                const isSelected = member.id === currentAssigneeId;
                return (
                  <CommandItem
                    key={member.id}
                    value={member.full_name}
                    onSelect={() =>
                      handleSelect(member.id, member.full_name)
                    }
                    className="flex items-center gap-2"
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

                    {isSelected && (
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
