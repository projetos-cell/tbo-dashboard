"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconCalendar,
  IconFolder,
  IconUsersGroup,
  IconCircleCheck,
  IconGitBranch,
  IconTag,
  IconUsers,
} from "@tabler/icons-react";
import { TaskAssigneePicker } from "./task-assignee-picker";
import { TaskDateRange } from "./task-date-range";
import { TaskProjectsList } from "./task-projects-list";
import { TaskCollaboratorsList } from "./task-collaborators-list";
import { TaskTagsDisplay } from "./task-tags-display";
import { TaskDependenciesSection } from "./task-dependencies-section";
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
  return (
    <div className="divide-y divide-border/50">
      {/* Responsável */}
      <FieldRow label="Responsável" icon={<IconUsers className="h-3.5 w-3.5" />}>
        <TaskAssigneePicker task={task} />
      </FieldRow>

      {/* Datas: Início + Prazo via TaskDateRange */}
      <FieldRow label="Datas" icon={<IconCalendar className="h-3.5 w-3.5" />}>
        <TaskDateRange task={task} />
      </FieldRow>

      {/* Concluída em */}
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

      {/* Projetos (multi-home) */}
      <FieldRow label="Projeto" icon={<IconFolder className="h-3.5 w-3.5" />}>
        <TaskProjectsList
          taskId={task.id}
          pickerOpen={projectPickerOpen}
          onPickerOpenChange={onProjectPickerOpenChange}
        />
      </FieldRow>

      {/* Tags */}
      <FieldRow label="Tags" icon={<IconTag className="h-3.5 w-3.5" />}>
        <TaskTagsDisplay taskId={task.id} />
      </FieldRow>

      {/* Colaboradores */}
      <FieldRow
        label="Colaboradores"
        icon={<IconUsersGroup className="h-3.5 w-3.5" />}
      >
        <TaskCollaboratorsList taskId={task.id} />
      </FieldRow>

      {/* Dependências */}
      <FieldRow label="Dependências" icon={<IconGitBranch className="h-3.5 w-3.5" />}>
        <TaskDependenciesSection task={task} onOpenTask={onOpenTask} />
      </FieldRow>

      {/* Campos personalizados placeholder */}
      <FieldRow label="Campos custom">
        <span className="text-sm text-muted-foreground">Nenhum campo</span>
      </FieldRow>
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
    <div className="flex items-start gap-3 py-2.5 min-h-[36px]">
      <div className="flex items-center gap-1.5 w-[120px] shrink-0 mt-0.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
