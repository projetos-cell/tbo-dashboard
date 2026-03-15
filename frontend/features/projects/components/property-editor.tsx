"use client";

import { useState, useCallback } from "react";
import {
  IconPlus,
  IconGripVertical,
  IconTrash,
  IconPencil,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  usePropertyOptions,
  useCreatePropertyOption,
  useUpdatePropertyOption,
  useDeletePropertyOption,
  useReorderPropertyOptions,
} from "@/features/projects/hooks/use-project-properties";
import type {
  PropertyType,
  PropertyCategory,
  PropertyOption,
} from "@/features/projects/services/project-properties";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  todo: "A fazer",
  in_progress: "Em andamento",
  done: "Concluídos",
};

const PRESET_COLORS = [
  "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6b7280", "#0ea5e9",
];

function colorToBg(hex: string): string {
  // Convert hex to rgba with 12% opacity
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
}

/* ── Sortable item ──────────────────────────────────────────────────── */

function SortableOption({
  option,
  property,
  onUpdate,
  onDelete,
}: {
  option: PropertyOption;
  property: PropertyType;
  onUpdate: (id: string, updates: Partial<PropertyOption>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(option.label);
  const [color, setColor] = useState(option.color);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isFallback = option.id.startsWith("fallback-");

  function save() {
    if (label.trim() && !isFallback) {
      onUpdate(option.id, {
        label: label.trim(),
        color,
        bg: colorToBg(color),
      });
    }
    setEditing(false);
  }

  function cancel() {
    setLabel(option.label);
    setColor(option.color);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 transition-colors",
        isDragging && "shadow-md",
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground shrink-0"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-3.5" />
      </button>

      {editing ? (
        <>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-5 rounded-full border-0 p-0 cursor-pointer appearance-none"
              style={{ backgroundColor: color }}
            >
              {PRESET_COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-7 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              autoFocus
            />
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={save}>
            <IconCheck className="size-3.5 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={cancel}>
            <IconX className="size-3.5" />
          </Button>
        </>
      ) : (
        <>
          <Badge
            variant="secondary"
            className="gap-1.5 text-xs select-none"
            style={{ backgroundColor: option.bg, color: option.color }}
          >
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: option.color }}
            />
            {option.label}
          </Badge>

          {property === "status" && option.category && (
            <span className="text-[10px] text-muted-foreground ml-auto mr-1">
              {CATEGORY_LABELS[option.category]}
            </span>
          )}

          <div className="ml-auto flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setEditing(true)}
              disabled={isFallback}
            >
              <IconPencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-red-600"
              onClick={() => onDelete(option.id)}
              disabled={isFallback}
            >
              <IconTrash className="size-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── New option form ────────────────────────────────────────────────── */

function NewOptionForm({
  property,
  onAdd,
  nextOrder,
}: {
  property: PropertyType;
  onAdd: (input: {
    key: string;
    label: string;
    color: string;
    bg: string;
    category?: PropertyCategory | null;
    sort_order: number;
  }) => void;
  nextOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [category, setCategory] = useState<PropertyCategory>("in_progress");

  function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;

    const key = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    onAdd({
      key,
      label: trimmed,
      color,
      bg: colorToBg(color),
      category: property === "status" ? category : null,
      sort_order: nextOrder,
    });

    setLabel("");
    setColor("#6b7280");
    setCategory("in_progress");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-1.5 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <IconPlus className="size-3.5" />
        Adicionar opção
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
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
      </div>

      <Input
        placeholder="Nome da opção..."
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        autoFocus
      />

      {property === "status" && (
        <Select value={category} onValueChange={(v) => setCategory(v as PropertyCategory)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">A fazer</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="done">Concluídos</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs" onClick={submit} disabled={!label.trim()}>
          Criar
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

/* ── Main editor ────────────────────────────────────────────────────── */

interface PropertyEditorProps {
  property: PropertyType;
  trigger?: React.ReactNode;
}

export function PropertyEditor({ property, trigger }: PropertyEditorProps) {
  const { data: options = [] } = usePropertyOptions(property);
  const createOption = useCreatePropertyOption();
  const updateOption = useUpdatePropertyOption(property);
  const deleteOption = useDeletePropertyOption(property);
  const reorderOptions = useReorderPropertyOptions(property);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = options.findIndex((o) => o.id === active.id);
      const newIndex = options.findIndex((o) => o.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(options, oldIndex, newIndex);
      const updates = reordered.map((o, i) => ({ id: o.id, sort_order: i }));
      reorderOptions.mutate(updates);
    },
    [options, reorderOptions]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<PropertyOption>) => {
      updateOption.mutate({ id, updates });
    },
    [updateOption]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteOption.mutate(id);
    },
    [deleteOption]
  );

  const handleAdd = useCallback(
    (input: {
      key: string;
      label: string;
      color: string;
      bg: string;
      category?: PropertyCategory | null;
      sort_order: number;
    }) => {
      createOption.mutate({ property, ...input });
    },
    [createOption, property]
  );

  const title = property === "status" ? "Status do Projeto" : "Prioridade do Projeto";

  // Group by category for status
  const grouped =
    property === "status"
      ? {
          todo: options.filter((o) => o.category === "todo"),
          in_progress: options.filter((o) => o.category === "in_progress"),
          done: options.filter((o) => o.category === "done"),
        }
      : null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            Editar {title}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {grouped ? (
            // Status: grouped by category
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABELS[cat]}
                </h4>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((o) => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1.5">
                      {items.map((opt) => (
                        <SortableOption
                          key={opt.id}
                          option={opt}
                          property={property}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ))
          ) : (
            // Priority: flat list
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={options.map((o) => o.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {options.map((opt) => (
                    <SortableOption
                      key={opt.id}
                      option={opt}
                      property={property}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <NewOptionForm
            property={property}
            onAdd={handleAdd}
            nextOrder={options.length}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
