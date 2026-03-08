"use client";

import { useState } from "react";
import { Button } from "@/components/tbo-ui/button";
import { Input } from "@/components/tbo-ui/input";
import { Checkbox } from "@/components/tbo-ui/checkbox";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCreatePdiAction,
  useTogglePdiAction,
  useDeletePdiAction,
} from "@/hooks/use-pdi";
import { useToast } from "@/hooks/use-toast";
import { isOverdue, formatShortDate } from "@/lib/pdi-utils";
import { Plus, Trash2, CalendarDays, Link2 } from "lucide-react";
import type { PdiActionRow } from "@/services/pdi";

interface PdiActionsInlineProps {
  goalId: string;
  pdiId: string;
  actions: PdiActionRow[];
  mode?: "full" | "readonly";
}

export function PdiActionsInline({ goalId, pdiId, actions, mode = "full" }: PdiActionsInlineProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const createAction = useCreatePdiAction();
  const toggleAction = useTogglePdiAction();
  const deleteAction = useDeletePdiAction();

  const [newText, setNewText] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  function handleCreate() {
    if (!newText.trim() || !tenantId) return;
    createAction.mutate(
      {
        tenant_id: tenantId,
        pdi_goal_id: goalId,
        text: newText.trim(),
        due_date: newDueDate || null,
      },
      {
        onSuccess: () => {
          setNewText("");
          setNewDueDate("");
        },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleToggle(action: PdiActionRow) {
    toggleAction.mutate({
      actionId: action.id,
      completed: !action.completed,
      goalId,
      pdiId,
    });
  }

  function handleDelete(actionId: string) {
    deleteAction.mutate({ actionId, goalId, pdiId });
  }

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <div
          key={action.id}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <Checkbox
            checked={action.completed}
            onCheckedChange={() => handleToggle(action)}
            disabled={mode === "readonly"}
          />
          <span
            className={`flex-1 ${action.completed ? "text-gray-500 line-through" : ""}`}
          >
            {action.text}
          </span>
          {action.one_on_one_action_id && (
            <span title="Vinculada a 1:1"><Link2 className="h-3 w-3 text-gray-500" /></span>
          )}
          {action.due_date && (
            <span
              className={`flex items-center gap-1 text-xs ${
                !action.completed && isOverdue(action.due_date) ? "text-red-500" : "text-gray-500"
              }`}
            >
              <CalendarDays className="h-3 w-3" />
              {formatShortDate(action.due_date)}
            </span>
          )}
          {mode === "full" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-red-500"
              onClick={() => handleDelete(action.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}

      {mode === "full" && (
        <div className="flex items-center gap-2">
          <Input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Nova ação..."
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="h-8 w-36 text-sm"
          />
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={handleCreate}
            disabled={!newText.trim() || createAction.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
