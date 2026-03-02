"use client";

import { useState } from "react";
import { Trash2, Plus, Link2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOneOnOneActions, useCreateAction, useToggleAction, useDeleteAction } from "@/hooks/use-one-on-ones";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate } from "@/lib/one-on-one-utils";
import type { ActionRow } from "@/services/one-on-ones";

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
          <div key={i} className="h-10 animate-pulse rounded border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (!actions.length) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma ação pendente</p>;
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
              <span className="text-xs text-muted-foreground">{getName(a.assignee_id)}</span>
            )}
            {a.due_date && (
              <span className={`text-xs ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}>
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

export function OneOnOneActions({ oneOnOneId, mode = "full" }: OneOnOneActionsProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: actions, isLoading } = useOneOnOneActions(oneOnOneId);
  const createMutation = useCreateAction();
  const toggleMutation = useToggleAction();
  const deleteMutation = useDeleteAction();

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
          <div key={i} className="h-8 animate-pulse rounded bg-muted/40" />
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
        <p className="text-sm text-muted-foreground">Nenhuma ação registrada</p>
      )}

      <div className="space-y-1">
        {items.map((a) => {
          const overdue = !a.completed && a.due_date && new Date(a.due_date) < new Date();
          return (
            <div key={a.id} className="group flex items-center gap-2 rounded px-1 py-1 hover:bg-muted/50">
              <Checkbox
                checked={!!a.completed}
                disabled={mode === "readonly"}
                onCheckedChange={(checked) =>
                  toggleMutation.mutate({ actionId: a.id, completed: !!checked, oneOnOneId })
                }
              />
              <span className={`flex-1 text-sm ${a.completed ? "text-muted-foreground line-through" : ""}`}>
                {a.text}
              </span>
              {a.pdi_link_id && (
                <span title="Vinculado ao PDI"><Link2 className="h-3 w-3 text-blue-500" /></span>
              )}
              {a.category && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {a.category}
                </span>
              )}
              {a.due_date && (
                <span className={`text-xs ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}>
                  {formatDate(a.due_date)}
                </span>
              )}
              {mode === "full" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteMutation.mutate({ actionId: a.id, oneOnOneId })}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}
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
            <Plus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
      )}
    </div>
  );
}
