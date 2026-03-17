"use client";

import { useState, useRef, useEffect } from "react";
import { IconTrash, IconPlus, IconLink, IconPencil } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOneOnOneActions, useCreateAction, useToggleAction, useDeleteAction, useUpdateAction } from "@/features/one-on-ones/hooks/use-one-on-ones";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate } from "@/features/one-on-ones/utils/one-on-one-utils";
import type { ActionRow } from "@/features/one-on-ones/services/one-on-ones";

// ── Standalone pending actions list (for page-level display) ─────────────────

interface PendingActionsListProps {
  actions: ActionRow[];
  isLoading: boolean;
  getName: (id: string) => string;
  onToggle: (actionId: string, oneOnOneId: string, completed: boolean) => void;
}

export function PendingActionsList({ actions, isLoading, getName, onToggle }: PendingActionsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded border bg-gray-100/40" />
        ))}
      </div>
    );
  }

  if (!actions.length) {
    return <p className="py-4 text-center text-sm text-gray-500">Nenhuma ação pendente</p>;
  }

  return (
    <div className="divide-y rounded-lg border">
      {actions.map((a) => {
        const overdue = a.due_date && new Date(a.due_date) < new Date();
        return (
          <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
            <Checkbox
              checked={!!a.completed}
              onCheckedChange={(checked) => onToggle(a.id, a.one_on_one_id, !!checked)}
            />
            <span className="flex-1 text-sm">{a.text}</span>
            {a.assignee_id && (
              <span className="text-xs text-gray-500">{getName(a.assignee_id)}</span>
            )}
            {a.due_date && (
              <span className={`text-xs ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}>
                {formatDate(a.due_date)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Full actions component for a specific 1:1 ───────────────────────────────

interface OneOnOneActionsProps {
  oneOnOneId: string;
  mode?: "full" | "readonly";
}

// ── Inline editable action row ────────────────────────────────────────────────

function EditableActionRow({
  action,
  oneOnOneId,
  mode,
}: {
  action: ActionRow;
  oneOnOneId: string;
  mode: "full" | "readonly";
}) {
  const toggleMutation = useToggleAction();
  const updateMutation = useUpdateAction();
  const deleteMutation = useDeleteAction();

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(action.text ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    if (mode !== "full") return;
    setEditText(action.text ?? "");
    setEditing(true);
  }

  function commitEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === action.text) {
      setEditing(false);
      return;
    }
    updateMutation.mutate(
      { actionId: action.id, oneOnOneId, updates: { text: trimmed } },
      { onSuccess: () => setEditing(false) },
    );
  }

  const overdue = !action.completed && action.due_date && new Date(action.due_date) < new Date();

  return (
    <div className="group flex items-center gap-2 rounded px-1 py-1 hover:bg-gray-100/50">
      <Checkbox
        checked={!!action.completed}
        disabled={mode === "readonly"}
        onCheckedChange={(checked) =>
          toggleMutation.mutate({ actionId: action.id, completed: !!checked, oneOnOneId })
        }
      />

      {editing ? (
        <Input
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-7 flex-1 text-sm"
        />
      ) : (
        <span
          className={`flex-1 cursor-text text-sm ${action.completed ? "text-gray-500 line-through" : ""}`}
          onDoubleClick={startEdit}
        >
          {action.text}
        </span>
      )}

      {!editing && (
        <>
          {action.pdi_link_id && (
            <span title="Vinculado ao PDI"><IconLink className="h-3 w-3 text-blue-500" /></span>
          )}
          {action.category && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
              {action.category}
            </span>
          )}
          {action.due_date && (
            <span className={`text-xs ${overdue ? "font-medium text-red-600" : "text-gray-500"}`}>
              {formatDate(action.due_date)}
            </span>
          )}
          {mode === "full" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={startEdit}
              >
                <IconPencil className="h-3 w-3 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => deleteMutation.mutate({ actionId: action.id, oneOnOneId })}
              >
                <IconTrash className="h-3 w-3 text-red-500" />
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Full actions component for a specific 1:1 ───────────────────────────────

export function OneOnOneActions({ oneOnOneId, mode = "full" }: OneOnOneActionsProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: actions, isLoading } = useOneOnOneActions(oneOnOneId);
  const createMutation = useCreateAction();

  const [newText, setNewText] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  function handleCreate() {
    if (!newText.trim() || !tenantId) return;
    createMutation.mutate(
      {
        one_on_one_id: oneOnOneId,
        tenant_id: tenantId,
        text: newText.trim(),
        due_date: newDueDate || null,
        source: "manual",
      },
      { onSuccess: () => { setNewText(""); setNewDueDate(""); } }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-gray-100/40" />
        ))}
      </div>
    );
  }

  const items = actions ?? [];
  const pendingCount = items.filter((a) => !a.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">Ações</h4>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {items.length === 0 && mode === "readonly" && (
        <p className="text-sm text-gray-500">Nenhuma ação registrada</p>
      )}

      <div className="space-y-1">
        {items.map((a) => (
          <EditableActionRow key={a.id} action={a} oneOnOneId={oneOnOneId} mode={mode} />
        ))}
      </div>

      {mode === "full" && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            placeholder="Nova ação..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-8 text-sm"
          />
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="h-8 w-36 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 shrink-0"
            onClick={handleCreate}
            disabled={!newText.trim() || createMutation.isPending}
          >
            <IconPlus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
      )}
    </div>
  );
}
