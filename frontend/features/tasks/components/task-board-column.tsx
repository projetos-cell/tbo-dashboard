"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreatePropertyOption,
  useUpdatePropertyOption,
} from "@/features/projects/hooks/use-project-properties";
import { cn } from "@/lib/utils";
import { IconPlus, IconGripVertical } from "@tabler/icons-react";
import type { PropertyCategory } from "@/features/projects/services/project-properties";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ──────────────────────────────────────────────────

export interface ColumnDef {
  id: string;
  key: string;
  label: string;
  color: string;
}

// ─── Helpers ────────────────────────────────────────────────

const PRESET_COLORS = [
  "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6b7280", "#0ea5e9",
];

function colorToBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
}

// ─── AddColumnInline ────────────────────────────────────────

export function AddColumnInline({ nextOrder }: { nextOrder: number }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [category, setCategory] = useState<PropertyCategory>("in_progress");
  const createOption = useCreatePropertyOption();

  function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;

    const key = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    createOption.mutate({
      property: "status",
      key,
      label: trimmed,
      color,
      bg: colorToBg(color),
      category,
      sort_order: nextOrder,
    });

    setLabel("");
    setColor("#6b7280");
    setCategory("in_progress");
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="flex w-[280px] min-w-[280px] shrink-0 flex-col">
        <Button
          variant="ghost"
          className="h-auto flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/20 py-8 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
          onClick={() => setOpen(true)}
        >
          <IconPlus className="size-5" />
          <span className="text-xs font-medium">Adicionar coluna</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-[280px] min-w-[280px] shrink-0 flex-col">
      <div className="rounded-lg border bg-card p-3 space-y-3">
        <Input
          placeholder="Nome do status..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          autoFocus
        />

        <div className="flex flex-wrap gap-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "size-5 rounded-full transition-all",
                color === c && "ring-2 ring-offset-1 ring-primary",
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <Select value={category} onValueChange={(v) => setCategory(v as PropertyCategory)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">A fazer</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="done">Concluídos</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={submit}
            disabled={!label.trim() || createOption.isPending}
          >
            Criar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── EditableColumnHeader ───────────────────────────────────

export function EditableColumnHeader({
  optionId,
  label,
  color,
  count,
  dragHandleProps,
}: {
  optionId: string;
  label: string;
  color: string;
  count: number;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateOption = useUpdatePropertyOption("status");

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleConfirm = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== label) {
      updateOption.mutate({ id: optionId, updates: { label: trimmed } });
    }
    setIsEditing(false);
  };

  return (
    <div className="mb-3 flex items-center gap-2">
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="flex shrink-0 cursor-grab items-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
        >
          <IconGripVertical className="size-3.5" />
        </div>
      )}
      <div
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") { setEditValue(label); setIsEditing(false); }
          }}
          onBlur={handleConfirm}
          className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-primary/40"
        />
      ) : (
        <h3
          className="text-sm font-medium cursor-pointer hover:underline decoration-muted-foreground/30 underline-offset-2"
          onClick={() => { setEditValue(label); setIsEditing(true); }}
          title="Clique para renomear"
        >
          {label}
        </h3>
      )}
      <Badge variant="secondary" className="ml-auto text-xs">
        {count}
      </Badge>
    </div>
  );
}

// ─── SortableColumn ─────────────────────────────────────────

export function SortableColumn({
  col,
  children,
  dragHandleSlot,
}: {
  col: ColumnDef;
  children: React.ReactNode;
  dragHandleSlot: (listeners: Record<string, unknown>, isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `col-${col.id}` });

  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, scaleY: 1, scaleX: 1 } : null),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex w-[280px] min-w-[280px] shrink-0 flex-col"
      role="group"
      aria-label={col.label}
    >
      {dragHandleSlot(listeners ?? {}, isDragging)}
      {children}
    </div>
  );
}
