"use client";

import { useState, useRef, useCallback } from "react";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export function TaskEffortFields({ task }: { task: TaskRow }) {
  const updateTask = useUpdateTask();
  const estimated = (task as Record<string, unknown>).estimated_hours as number | null;
  const logged = (task as Record<string, unknown>).logged_hours as number | null;

  return (
    <div className="flex items-center gap-3">
      <HoursInput
        label="Estimado"
        value={estimated}
        onSave={(v) =>
          updateTask.mutate({
            id: task.id,
            updates: { estimated_hours: v } as never,
          })
        }
      />
      <span className="text-muted-foreground text-xs">/</span>
      <HoursInput
        label="Registrado"
        value={logged}
        onSave={(v) =>
          updateTask.mutate({
            id: task.id,
            updates: { logged_hours: v } as never,
          })
        }
      />
    </div>
  );
}

function HoursInput({
  label,
  value,
  onSave,
}: {
  label: string;
  value: number | null;
  onSave: (v: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = useCallback(() => {
    const num = parseFloat(draft);
    const newVal = isNaN(num) || num < 0 ? null : num;
    if (newVal !== value) onSave(newVal);
    setEditing(false);
  }, [draft, value, onSave]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value?.toString() ?? "");
          setEditing(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded px-1.5 py-0.5 transition-colors"
      >
        {value != null ? `${value}h` : label}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      min="0"
      step="0.5"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
      className="w-14 rounded border border-border bg-background px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary"
      placeholder="0h"
    />
  );
}
