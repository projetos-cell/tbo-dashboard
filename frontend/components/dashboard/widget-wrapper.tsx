"use client";

import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/tbo-ui/button";

interface WidgetWrapperProps {
  id: string;
  label: string;
  children: ReactNode;
  onClose: () => void;
  /** When true the drag handle is hidden (e.g. on mobile) */
  disableDrag?: boolean;
  /** CSS grid column span */
  colSpan?: 1 | 2;
}

export function WidgetWrapper({
  id,
  label,
  children,
  onClose,
  disableDrag = false,
  colSpan = 1,
}: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: disableDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        rounded-xl border bg-white text-gray-900 shadow-sm
        ${colSpan === 2 ? "lg:col-span-2" : ""}
        ${isDragging ? "z-50 opacity-60 ring-2 ring-tbo-orange/40" : ""}
      `}
    >
      {/* Header with drag handle + close */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        {!disableDrag && (
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab rounded p-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tbo-orange"
            aria-label={`Arrastar ${label}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <h3 className="flex-1 text-sm font-semibold truncate">{label}</h3>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={onClose}
          aria-label={`Fechar ${label}`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Widget content */}
      <div className="p-0">{children}</div>
    </div>
  );
}
