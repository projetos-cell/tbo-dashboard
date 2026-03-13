"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  FolderOpen,
  GitBranch,
  Tag,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskAssigneePicker } from "./task-assignee-picker";
import type { Tag as TagType } from "@/schemas/tag";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Helpers ──────────────────────────────────────────

function formatDatePtBR(dateStr: string | null): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "dd MMM yyyy", { locale: ptBR });
}

// ─── Types ────────────────────────────────────────────

interface TaskDetailFieldsProps {
  task: TaskRow;
  tags: TagType[];
  projectName: string | null;
}

// ─── Component ────────────────────────────────────────

export function TaskDetailFields({
  task,
  tags,
  projectName,
}: TaskDetailFieldsProps) {
  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  return (
    <div className="divide-y divide-border/50">
      {/* Responsável */}
      <FieldRow label="Responsável" icon={<Users className="h-3.5 w-3.5" />}>
        <TaskAssigneePicker task={task} />
      </FieldRow>

      {/* Prazo */}
      <FieldRow label="Prazo" icon={<Calendar className="h-3.5 w-3.5" />}>
        <span
          className={`text-sm ${
            overdue ? "text-red-600 font-medium" : task.due_date ? "" : "text-muted-foreground"
          }`}
        >
          {task.due_date ? formatDatePtBR(task.due_date) : "Sem prazo"}
        </span>
      </FieldRow>

      {/* Início */}
      <FieldRow label="Início" icon={<Calendar className="h-3.5 w-3.5" />}>
        <span className={`text-sm ${task.start_date ? "" : "text-muted-foreground"}`}>
          {task.start_date ? formatDatePtBR(task.start_date) : "—"}
        </span>
      </FieldRow>

      {/* Concluída em */}
      {task.is_completed && task.completed_at && (
        <FieldRow
          label="Concluída em"
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
        >
          <span className="text-sm text-green-700">
            {format(new Date(task.completed_at), "dd MMM yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </span>
        </FieldRow>
      )}

      {/* Projeto */}
      <FieldRow label="Projeto" icon={<FolderOpen className="h-3.5 w-3.5" />}>
        <span className={`text-sm ${projectName ? "" : "text-muted-foreground"}`}>
          {projectName || "Adicionar a projetos"}
        </span>
      </FieldRow>

      {/* Tags */}
      <FieldRow label="Tags" icon={<Tag className="h-3.5 w-3.5" />}>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
                style={
                  tag.color
                    ? { backgroundColor: tag.color, color: "#fff" }
                    : undefined
                }
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Nenhuma tag</span>
        )}
      </FieldRow>

      {/* Dependências */}
      <FieldRow label="Dependências" icon={<GitBranch className="h-3.5 w-3.5" />}>
        <span className="text-sm text-muted-foreground">
          Adicionar dependências
        </span>
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
    <div className="flex items-center gap-3 py-2.5 min-h-[36px]">
      <div className="flex items-center gap-1.5 w-[120px] shrink-0">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
