"use client";

import { useState } from "react";
import { IconCheck, IconSelector, IconUserOff, IconUsers, IconPlus } from "@tabler/icons-react";
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
import {
  useTaskAssignees,
  useAddAssignee,
  useRemoveAssignee,
} from "@/features/tasks/hooks/use-task-assignees";
import { useAuthStore } from "@/stores/auth-store";
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
  const { data: assignees = [] } = useTaskAssignees(task.id);
  const updateTask = useUpdateTask();
  const addAssignee = useAddAssignee();
  const removeAssignee = useRemoveAssignee();
  const tenantId = useAuthStore((s) => s.tenantId);

  const assigneeIds = new Set(assignees.map((a) => a.user_id));

  function handleToggle(memberId: string, memberName: string) {
    if (assigneeIds.has(memberId)) {
      // Remove assignee
      removeAssignee.mutate({ taskId: task.id, userId: memberId });

      // If removing primary assignee, set next one or clear
      if (task.assignee_id === memberId) {
        const remaining = assignees.filter((a) => a.user_id !== memberId);
        if (remaining.length > 0) {
          const nextId = remaining[0].user_id;
          const nextMember = members?.find((m) => m.id === nextId);
          updateTask.mutate({
            id: task.id,
            updates: {
              assignee_id: nextId,
              assignee_name: nextMember?.full_name ?? null,
            },
          });
        } else {
          updateTask.mutate({
            id: task.id,
            updates: { assignee_id: null, assignee_name: null },
          });
        }
      }
    } else {
      // Add assignee
      if (tenantId) {
        addAssignee.mutate({
          task_id: task.id,
          user_id: memberId,
          tenant_id: tenantId,
          role: "assignee",
        });
      }

      // If no primary assignee, set this one as primary
      if (!task.assignee_id) {
        updateTask.mutate({
          id: task.id,
          updates: {
            assignee_id: memberId,
            assignee_name: memberName,
          },
        });
      }
    }
  }

  function handleClearAll() {
    setOpen(false);
    // Remove all from junction table
    for (const a of assignees) {
      removeAssignee.mutate({ taskId: task.id, userId: a.user_id });
    }
    // Clear primary
    updateTask.mutate({
      id: task.id,
      updates: { assignee_id: null, assignee_name: null },
    });
  }

  // Resolve assignee names from members list
  const assigneeMembers = (members ?? []).filter((m) => assigneeIds.has(m.id));

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
          {assigneeMembers.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {/* Overlapping avatars */}
              <div className="flex -space-x-1.5">
                {assigneeMembers.slice(0, 3).map((m) => (
                  <Avatar key={m.id} className="h-5 w-5 ring-2 ring-background">
                    {m.avatar_url && <AvatarImage src={m.avatar_url} alt={m.full_name} />}
                    <AvatarFallback className="text-[8px] font-semibold bg-blue-100 text-blue-700">
                      {getInitials(m.full_name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {assigneeMembers.length > 3 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted ring-2 ring-background text-[8px] font-semibold text-muted-foreground">
                    +{assigneeMembers.length - 3}
                  </span>
                )}
              </div>
              <span className="truncate max-w-[140px]">
                {assigneeMembers.length === 1
                  ? assigneeMembers[0].full_name
                  : `${assigneeMembers.length} responsáveis`}
              </span>
            </div>
          ) : task.assignee_name ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px] font-semibold bg-blue-100 text-blue-700">
                  {getInitials(task.assignee_name)}
                </AvatarFallback>
              </Avatar>
              <span>{task.assignee_name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sem responsável</span>
          )}
          <IconSelector className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Buscar membro..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Carregando..." : "Nenhum membro encontrado"}
            </CommandEmpty>

            {/* Clear all option */}
            {assigneeIds.size > 0 && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClearAll}
                    className="text-muted-foreground"
                  >
                    <IconUserOff className="mr-2 h-4 w-4" />
                    Remover todos
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Member list — multi-select with checkmarks */}
            <CommandGroup heading="Membros">
              {(members ?? []).map((member) => {
                const isSelected = assigneeIds.has(member.id);
                return (
                  <CommandItem
                    key={member.id}
                    value={member.full_name}
                    onSelect={() => handleToggle(member.id, member.full_name)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                    </div>

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
