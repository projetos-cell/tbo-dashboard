"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DemandPropertyRowProps {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  label: string;
  onClear?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DemandPropertyRow({
  id,
  icon: Icon,
  label,
  onClear,
  children,
  className,
}: DemandPropertyRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1.5 min-h-[32px] rounded-md px-1 -mx-1 transition-colors",
        "hover:bg-muted/50",
        isDragging && "opacity-50 bg-muted/30",
        className,
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none shrink-0"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-3 text-muted-foreground" />
      </button>

      {/* Icon + Label */}
      <div className="flex items-center gap-1.5 w-[88px] shrink-0">
        <Icon className="size-3 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium text-muted-foreground truncate">
          {label}
        </span>
      </div>

      {/* Value slot */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Clear button */}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5 rounded hover:bg-destructive/10"
          aria-label={`Limpar ${label}`}
        >
          <IconX className="size-3 text-muted-foreground hover:text-destructive" />
        </button>
      )}
    </div>
  );
}
