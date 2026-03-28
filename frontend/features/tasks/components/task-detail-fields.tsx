"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconCalendar,
  IconFolder,
  IconCircleCheck,
  IconGitBranch,
  IconTag,
  IconUsers,
  IconShieldCheck,
  IconDiamond,
  IconClock,
  IconRepeat,
  IconBell,
  IconChevronDown,
  IconChevronUp,
  IconSettings,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { TaskAssigneePicker } from "./task-assignee-picker";
import { TaskDateRange } from "./task-date-range";
import { TaskProjectsList } from "./task-projects-list";
import { TaskTagsDisplay } from "./task-tags-display";
import { TaskDependenciesSection } from "./task-dependencies-section";
import { CustomFieldsSection } from "./custom-fields-section";
import { TaskApprovalSelect } from "./task-approval-select";
import { TaskMilestoneToggle } from "./task-milestone-toggle";
import { TaskEffortFields } from "./task-effort-fields";
import { TaskRecurrenceSelect } from "./task-recurrence-select";
import { TaskReminderSelect } from "./task-reminder-select";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Types ────────────────────────────────────────────

interface TaskDetailFieldsProps {
  task: TaskRow;
  projectName: string | null;
  /** Controlled: se true, abre o picker de projetos via atalho Tab+P */
  projectPickerOpen?: boolean;
  onProjectPickerOpenChange?: (open: boolean) => void;
  /** Callback para abrir outra tarefa no sheet (dependências) */
  onOpenTask?: (taskId: string) => void;
}

// ─── Component ────────────────────────────────────────

export function TaskDetailFields({
  task,
  projectName: _projectName,
  projectPickerOpen,
  onProjectPickerOpenChange,
  onOpenTask,
}: TaskDetailFieldsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Detect if any advanced field has a value (auto-expand if so)
  const taskAny = task as Record<string, unknown>;
  const hasAdvancedValue =
    !!taskAny.is_milestone ||
    !!taskAny.estimated_hours ||
    !!taskAny.logged_hours ||
    !!taskAny.recurrence_rule ||
    !!taskAny.reminder_at;

  return (
    <div className="space-y-0">
      {/* ── Campos essenciais ─────────────────── */}
      <div className="divide-y divide-border/40">
        <FieldRow label="Responsável" icon={<IconUsers className="h-3.5 w-3.5" />}>
          <TaskAssigneePicker task={task} />
        </FieldRow>

        <FieldRow label="Datas" icon={<IconCalendar className="h-3.5 w-3.5" />}>
          <TaskDateRange task={task} />
        </FieldRow>

        {task.is_completed && task.completed_at && (
          <FieldRow
            label="Concluída em"
            icon={<IconCircleCheck className="h-3.5 w-3.5 text-green-600" />}
          >
            <span className="text-sm text-green-700">
              {format(new Date(task.completed_at), "dd MMM yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </span>
          </FieldRow>
        )}

        <FieldRow label="Projeto" icon={<IconFolder className="h-3.5 w-3.5" />}>
          <TaskProjectsList
            taskId={task.id}
            pickerOpen={projectPickerOpen}
            onPickerOpenChange={onProjectPickerOpenChange}
          />
        </FieldRow>

        <FieldRow label="Tags" icon={<IconTag className="h-3.5 w-3.5" />}>
          <TaskTagsDisplay taskId={task.id} />
        </FieldRow>

        <FieldRow label="Aprovação" icon={<IconShieldCheck className="h-3.5 w-3.5" />}>
          <TaskApprovalSelect task={task} />
        </FieldRow>

        {/* Dependências */}
        <FieldRow label="Dependências" icon={<IconGitBranch className="h-3.5 w-3.5" />}>
          <TaskDependenciesSection task={task} onOpenTask={onOpenTask} />
        </FieldRow>
      </div>

      {/* ── Campos avançados (colapsável) ─────── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className={cn(
            "flex items-center gap-1.5 w-full text-left py-1.5 group",
            "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
          )}
        >
          <IconSettings className="h-3 w-3" />
          <span>Detalhes avançados</span>
          {showAdvanced ? (
            <IconChevronUp className="h-3 w-3 ml-auto" />
          ) : (
            <IconChevronDown className="h-3 w-3 ml-auto" />
          )}
          {!showAdvanced && hasAdvancedValue && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary ml-1" />
          )}
        </button>

        {(showAdvanced || hasAdvancedValue) && (
          <div className="divide-y divide-border/40 animate-in fade-in slide-in-from-top-1 duration-150">
            <FieldRow label="Marco" icon={<IconDiamond className="h-3.5 w-3.5" />}>
              <TaskMilestoneToggle task={task} />
            </FieldRow>

            <FieldRow label="Esforço" icon={<IconClock className="h-3.5 w-3.5" />}>
              <TaskEffortFields task={task} />
            </FieldRow>

            <FieldRow label="Repetição" icon={<IconRepeat className="h-3.5 w-3.5" />}>
              <TaskRecurrenceSelect task={task} />
            </FieldRow>

            <FieldRow label="Lembrete" icon={<IconBell className="h-3.5 w-3.5" />}>
              <TaskReminderSelect task={task} />
            </FieldRow>
          </div>
        )}
      </div>

      {/* ── Campos personalizados ─────────────── */}
      <div className="pt-1">
        <CustomFieldsSection taskId={task.id} />
      </div>
    </div>
  );
}

// ─── Field Row (Asana-style key-value) ────────────────

function FieldRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 min-h-[36px] group/row hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors duration-100">
      <div className="flex items-center gap-1.5 w-[120px] shrink-0 mt-0.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
