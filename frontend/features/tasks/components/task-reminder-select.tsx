"use client";

import { IconBell, IconBellOff } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

const REMINDER_OPTIONS = [
  { value: "0", label: "No dia do prazo" },
  { value: "1", label: "1 dia antes" },
  { value: "2", label: "2 dias antes" },
  { value: "3", label: "3 dias antes" },
  { value: "5", label: "5 dias antes" },
  { value: "7", label: "1 semana antes" },
  { value: "14", label: "2 semanas antes" },
] as const;

interface TaskReminderSelectProps {
  task: TaskRow;
}

export function TaskReminderSelect({ task }: TaskReminderSelectProps) {
  const updateTask = useUpdateTask();
  const reminderDays = (task as Record<string, unknown>).reminder_days as number | null;
  const hasDueDate = !!task.due_date;

  function handleChange(value: string) {
    const days = value === "__none__" ? null : parseInt(value, 10);
    updateTask.mutate({
      id: task.id,
      updates: { reminder_days: days } as never,
      previousTask: task,
    });
  }

  if (!hasDueDate) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <IconBellOff className="size-3" />
        Defina um prazo primeiro
      </span>
    );
  }

  return (
    <Select
      value={reminderDays != null ? String(reminderDays) : "__none__"}
      onValueChange={handleChange}
    >
      <SelectTrigger className="h-7 text-xs w-auto min-w-[140px]">
        <div className="flex items-center gap-1.5">
          <IconBell className="size-3 text-muted-foreground" />
          <SelectValue placeholder="Sem lembrete" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">Sem lembrete</SelectItem>
        {REMINDER_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
