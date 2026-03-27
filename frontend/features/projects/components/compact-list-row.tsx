"use client";

import Link from "next/link";
import {
  IconEdit,
  IconExternalLink,
  IconCopy,
  IconArchive,
  IconTrash,
} from "@tabler/icons-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { Project } from "./compact-list-helpers";
import { isUUID } from "./compact-list-helpers";
import type { ExtraColumn } from "./compact-list-columns";
import { ExtraColumnCell } from "./compact-list-columns";
import { EditableText, StatusSelect, DateCell } from "./compact-list-editors";
import { PersonSelect, ConstrutoraSelect } from "./compact-list-pickers";

// ─── Grid Row with Context Menu + Inline Editing ──────────────────────────────

export function GridRow({
  project,
  extraColumns,
  construtoras,
  columnWidths,
  onOpen,
  onUpdate,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  project: Project;
  extraColumns: ExtraColumn[];
  construtoras: string[];
  columnWidths: Record<string, number>;
  onOpen: () => void;
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex items-center gap-0 border-b border-border/30 px-3 py-2 transition-colors last:border-b-0 hover:bg-muted/30">
          {/* Code -- read only */}
          <div className="px-2" style={{ width: columnWidths.code ?? 90, flex: "0 0 auto" }}>
            <Link
              href={`/projetos/${project.id}`}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline"
            >
              {project.code || "\u2014"}
            </Link>
          </div>

          {/* Name -- editable */}
          <div className="px-2" style={{ flex: "1 1 0%", minWidth: 200 }}>
            <EditableText
              value={project.name ?? ""}
              onSave={(v) => onUpdate(project.id, { name: v })}
              className="text-sm font-medium"
              linkHref={`/projetos/${project.id}`}
            />
          </div>

          {/* Status -- editable dropdown */}
          <div className="px-2" style={{ width: columnWidths.status ?? 130, flex: "0 0 auto" }}>
            <StatusSelect
              value={project.status ?? ""}
              onChange={(v) => onUpdate(project.id, { status: v })}
            />
          </div>

          {/* Construtora -- editable dropdown */}
          <div className="hidden px-2 md:block" style={{ width: columnWidths.construtora ?? 160, flex: "0 0 auto" }}>
            <ConstrutoraSelect
              value={project.construtora && !isUUID(project.construtora) ? project.construtora : ""}
              construtoras={construtoras}
              onChange={(v) => onUpdate(project.id, { construtora: v })}
            />
          </div>

          {/* Owner -- editable dropdown */}
          <div className="hidden px-2 md:block" style={{ width: columnWidths.owner ?? 140, flex: "0 0 auto" }}>
            <PersonSelect
              value={project.owner_name ?? ""}
              currentId={project.owner_id ?? ""}
              onChange={(id, name) =>
                onUpdate(project.id, { owner_id: id, owner_name: name })
              }
            />
          </div>

          {/* Due date -- editable */}
          <div className="hidden px-2 md:block" style={{ width: columnWidths.due_date ?? 120, flex: "0 0 auto" }}>
            <DateCell
              value={project.due_date_end}
              onChange={(v) => onUpdate(project.id, { due_date_end: v })}
            />
          </div>

          {/* Extra dynamic columns */}
          {extraColumns.map((col) => (
            <div key={col.id} className={cn("hidden px-2 md:block", col.width)}>
              <ExtraColumnCell
                project={project}
                column={col}
                onUpdate={onUpdate}
              />
            </div>
          ))}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={onOpen}>
          <IconEdit className="mr-2 size-3.5" />
          Abrir projeto
        </ContextMenuItem>
        {project.notion_url && (
          <ContextMenuItem
            onClick={() => window.open(project.notion_url!, "_blank")}
          >
            <IconExternalLink className="mr-2 size-3.5" />
            Abrir no Notion
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDuplicate}>
          <IconCopy className="mr-2 size-3.5" />
          Duplicar projeto
        </ContextMenuItem>
        <ContextMenuItem onClick={onArchive}>
          <IconArchive className="mr-2 size-3.5" />
          Pausar projeto
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onDelete}
        >
          <IconTrash className="mr-2 size-3.5" />
          Excluir projeto
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
