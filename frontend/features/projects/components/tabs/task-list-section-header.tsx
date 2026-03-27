"use client";

import { useRef, useEffect } from "react";
import { IconEdit, IconTrash } from "@tabler/icons-react";

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
      className="group flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-2"
      id={sectionId ? `section-header-${sectionId}` : undefined}
    >
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
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-xs text-muted-foreground">({count})</span>
          {sectionId && (
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
