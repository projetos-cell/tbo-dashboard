"use client";

import {
  IconGripVertical,
  IconDots,
  IconPencil,
  IconTrash,
  IconEye,
  IconBook,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

interface ManualSortableItemProps {
  item: CulturaRow;
  index: number;
  canEdit: boolean;
  onView: (item: CulturaRow) => void;
  onEdit: (item: CulturaRow) => void;
  onDelete: (item: CulturaRow) => void;
}

export function ManualSortableItem({
  item,
  index,
  canEdit,
  onView,
  onEdit,
  onDelete,
}: ManualSortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <Card className="group hover:shadow-sm transition-shadow">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          {canEdit && (
            <button
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5 transition-opacity shrink-0"
              aria-label="Arrastar para reordenar"
              tabIndex={-1}
            >
              <IconGripVertical className="size-3.5 text-gray-400" />
            </button>
          )}
          <div
            className="flex items-center justify-center size-8 rounded-md bg-sky-50 dark:bg-sky-900/20 text-sky-600 text-sm font-medium shrink-0 cursor-pointer"
            onClick={() => onView(item)}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(item)}>
            <h3 className="text-sm font-medium truncate">{item.title}</h3>
            {item.content_html && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {item.content_html.replace(/<[^>]*>/g, "").trim().slice(0, 100)}
              </p>
            )}
          </div>

          {canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Ações"
                >
                  <IconDots className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(item)}>
                  <IconEye className="size-3.5 mr-1.5" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <IconPencil className="size-3.5 mr-1.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(item)}>
                  <IconTrash className="size-3.5 mr-1.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <IconBook className="size-4 text-gray-500/40 shrink-0" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
