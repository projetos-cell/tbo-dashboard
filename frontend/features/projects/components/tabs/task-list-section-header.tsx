"use client";

import { useRef, useEffect } from "react";
import { IconEdit, IconTrash, IconChevronUp, IconChevronDown, IconGripVertical } from "@tabler/icons-react";

export interface SectionHeaderProps {
  label: string;
  color?: string;
  count: number;
  sectionId?: string;
  isEditing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onEditConfirm: () => void;
  onEditCancel: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  /** DnD handle listeners/attributes from useSortable — renders grip icon when present */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

export function SectionHeader({
  label,
  color,
  count,
  sectionId,
  isEditing,
  editValue,
  onStartEdit,
  onEditChange,
  onEditConfirm,
  onEditCancel,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragHandleProps,
  isDragging,
}: SectionHeaderProps) {
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      className={`group flex items-center gap-2 border-b border-border/40 bg-muted/20 py-2 ${dragHandleProps ? "px-1" : "px-5"} ${isDragging ? "opacity-40" : ""}`}
      id={sectionId ? `section-header-${sectionId}` : undefined}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="flex w-7 shrink-0 cursor-grab items-center justify-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
        >
          <IconGripVertical className="size-3.5" />
        </div>
      )}
      {color && (
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {isEditing ? (
        <input
          ref={editRef}
          type="text"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEditConfirm();
            if (e.key === "Escape") onEditCancel();
          }}
          onBlur={onEditConfirm}
          className="flex-1 bg-transparent text-xs font-semibold outline-none"
        />
      ) : (
        <>
          {sectionId ? (
            <button
              type="button"
              onClick={onStartEdit}
              className="text-xs font-semibold hover:underline transition-colors text-left"
              title="Clique para renomear"
            >
              {label}
            </button>
          ) : (
            <span className="text-xs font-semibold">{label}</span>
          )}
          <span className="text-xs text-muted-foreground">({count})</span>
          {sectionId && (
            <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onMoveUp && !isFirst && (
                <button
                  type="button"
                  onClick={onMoveUp}
                  className="flex size-5 items-center justify-center rounded hover:bg-accent/50 transition-colors"
                  title="Mover para cima"
                >
                  <IconChevronUp className="size-3" />
                </button>
              )}
              {onMoveDown && !isLast && (
                <button
                  type="button"
                  onClick={onMoveDown}
                  className="flex size-5 items-center justify-center rounded hover:bg-accent/50 transition-colors"
                  title="Mover para baixo"
                >
                  <IconChevronDown className="size-3" />
                </button>
              )}
              <button
                type="button"
                onClick={onStartEdit}
                className="flex size-5 items-center justify-center rounded hover:bg-accent/50 transition-colors"
                title="Renomear seção"
              >
                <IconEdit className="size-3" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex size-5 items-center justify-center rounded text-destructive hover:bg-destructive/10 transition-colors"
                  title="Excluir seção"
                >
                  <IconTrash className="size-3" />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
