"use client";

import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconPlus,
  IconTrash,
  IconCheck,
  IconListCheck,
} from "@tabler/icons-react";
import {
  useChecklistItems,
  useAddChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "../hooks/use-task-advanced";
import type { ChecklistItem } from "../hooks/use-task-advanced";

interface TaskChecklistProps {
  taskId: string;
}

export function TaskChecklist({ taskId }: TaskChecklistProps) {
  const { data: items, isLoading } = useChecklistItems(taskId);
  const addItem = useAddChecklistItem(taskId);
  const toggleItem = useToggleChecklistItem(taskId);
  const deleteItem = useDeleteChecklistItem(taskId);
  const updateItem = useUpdateChecklistItem(taskId);

  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const completed = (items ?? []).filter((i) => i.is_completed).length;
  const total = (items ?? []).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    addItem.mutate(
      { title, sort_order: total },
      {
        onSuccess: () => {
          setNewTitle("");
          inputRef.current?.focus();
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setNewTitle("");
  };

  const handleEditSave = (id: string) => {
    const title = editingTitle.trim();
    if (title) {
      updateItem.mutate({ id, updates: { title } });
    }
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconListCheck size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold">Checklist</h3>
        </div>
        {total > 0 && (
          <span className="text-xs text-muted-foreground">
            {completed}/{total}
          </span>
        )}
      </div>

      {total > 0 && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          {progress === 100 && (
            <div className="flex items-center gap-1 text-green-600">
              <IconCheck size={12} />
              <span className="text-xs font-medium">Concluído!</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <ul className="space-y-1">
        {(items ?? []).map((item: ChecklistItem) => (
          <li
            key={item.id}
            className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/40 transition-colors"
          >
            <Checkbox
              id={`check-${item.id}`}
              checked={item.is_completed}
              onCheckedChange={() => toggleItem.mutate(item.id)}
              className="shrink-0"
            />
            {editingId === item.id ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleEditSave(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSave(item.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="h-6 flex-1 border-0 bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            ) : (
              <label
                htmlFor={`check-${item.id}`}
                className={`flex-1 cursor-pointer select-none text-xs transition-colors ${
                  item.is_completed ? "line-through text-muted-foreground" : ""
                }`}
                onDoubleClick={() => {
                  setEditingId(item.id);
                  setEditingTitle(item.title);
                }}
              >
                {item.title}
              </label>
            )}
            <button
              onClick={() => deleteItem.mutate(item.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              aria-label="Remover item"
            >
              <IconTrash size={12} />
            </button>
          </li>
        ))}
      </ul>

      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Adicionar item..."
          className="h-8 flex-1 text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2"
          onClick={handleAdd}
          disabled={!newTitle.trim() || addItem.isPending}
        >
          <IconPlus size={14} />
        </Button>
      </div>
    </div>
  );
}
