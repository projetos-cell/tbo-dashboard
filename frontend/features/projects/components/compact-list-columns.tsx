"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Project } from "./compact-list-helpers";
import { EditableText, PrioritySelect, DateCell } from "./compact-list-editors";
import { PersonSelect } from "./compact-list-pickers";
import type { ExtraColumn } from "./compact-list-column-config";

// Re-export config and header so existing imports work via this barrel
export type { ColumnConfig, ExtraColumn } from "./compact-list-column-config";
export {
  COLUMNS,
  SUGGESTED_COLUMNS,
  TYPE_TO_COLUMN,
  PROPERTY_TYPES_SUGGESTED,
  PROPERTY_TYPES,
} from "./compact-list-column-config";
export { ColumnHeaderMenu } from "./compact-list-column-header";

// ─── Extra Column Cell Renderer ───────────────────────────────────────────────

export function ExtraColumnCell({
  project,
  column,
  onUpdate,
}: {
  project: Project;
  column: ExtraColumn;
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
}) {
  const raw = column.field !== "custom"
    ? (project as Record<string, unknown>)[column.field]
    : null;

  if (column.field === "priority") {
    return (
      <PrioritySelect
        value={typeof raw === "string" ? raw : ""}
        onChange={(v) => onUpdate(project.id, { priority: v })}
      />
    );
  }

  if (column.type === "select" && column.field === "owner_name") {
    return (
      <PersonSelect
        value={project.owner_name ?? ""}
        currentId={project.owner_id ?? ""}
        onChange={(id, name) =>
          onUpdate(project.id, { owner_id: id, owner_name: name })
        }
      />
    );
  }

  if (column.type === "date") {
    const val = typeof raw === "string" ? raw : null;
    return (
      <DateCell
        value={val}
        onChange={(v) => onUpdate(project.id, { [column.field]: v })}
      />
    );
  }

  if (column.type === "readonly") {
    const display = raw != null ? String(raw) : "\u2014";
    if (column.field === "created_at" || column.field === "updated_at") {
      return (
        <span className="truncate text-xs text-muted-foreground">
          {typeof raw === "string"
            ? format(new Date(raw), "dd MMM yyyy", { locale: ptBR })
            : "\u2014"}
        </span>
      );
    }
    return <span className="truncate text-sm text-muted-foreground">{display}</span>;
  }

  if (column.type === "number") {
    const num = typeof raw === "number" ? raw : null;
    return (
      <EditableText
        value={num != null ? String(num) : ""}
        onSave={(v) => onUpdate(project.id, { [column.field]: v ? Number(v) : null })}
        placeholder="\u2014"
        className="text-sm text-muted-foreground"
      />
    );
  }

  if (column.type === "url") {
    const val = typeof raw === "string" ? raw : "";
    return val ? (
      <a
        href={val}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="truncate text-xs text-blue-500 hover:underline"
      >
        {val.replace(/^https?:\/\//, "").slice(0, 30)}
      </a>
    ) : (
      <span className="text-sm text-muted-foreground">{"\u2014"}</span>
    );
  }

  const val = typeof raw === "string" ? raw : "";
  return (
    <EditableText
      value={val}
      onSave={(v) => onUpdate(project.id, { [column.field]: v })}
      placeholder="\u2014"
      className="text-sm text-muted-foreground"
    />
  );
}
