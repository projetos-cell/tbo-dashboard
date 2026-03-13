"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { ContractStatusBadge } from "./contract-status-badge";
import { ScopeProgressBar } from "./scope-progress-bar";
import {
  SCOPE_ITEM_STATUS,
  SCOPE_CATEGORIES,
  type ScopeItemStatusKey,
} from "../schemas/contract-schemas";

interface ScopeItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  value: number;
  status: string;
  progress_pct: number;
  estimated_start?: string | null;
  estimated_end?: string | null;
}

interface ScopeItemsTableProps {
  items: ScopeItem[];
  onUpdate?: (
    id: string,
    updates: { status?: string; progress_pct?: number }
  ) => void;
  readonly?: boolean;
}

export function ScopeItemsTable({
  items,
  onUpdate,
  readonly = false,
}: ScopeItemsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState(0);

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const weightedProgress =
    totalValue > 0
      ? items.reduce(
          (sum, item) => sum + item.progress_pct * item.value,
          0
        ) / totalValue
      : 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getCategoryLabel = (cat?: string | null) =>
    SCOPE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat ?? "—";

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso Geral</span>
          <span className="text-sm text-muted-foreground">
            {items.length} itens | {formatCurrency(totalValue)}
          </span>
        </div>
        <ScopeProgressBar progress={weightedProgress} />
      </div>

      {/* Items */}
      <div className="rounded-lg border divide-y">
        {items.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div key={item.id} className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {getCategoryLabel(item.category)} |{" "}
                    {formatCurrency(item.value)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ContractStatusBadge status={item.status} type="scope" />

                  {!readonly && onUpdate && !isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditProgress(item.progress_pct);
                      }}
                    >
                      <IconPencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <ScopeProgressBar progress={item.progress_pct} size="sm" />

              {isEditing && onUpdate && (
                <div className="flex items-center gap-2 pt-1">
                  <Select
                    value={item.status}
                    onValueChange={(v) => {
                      onUpdate(item.id, { status: v });
                    }}
                  >
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SCOPE_ITEM_STATUS).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={editProgress}
                    onChange={(e) =>
                      setEditProgress(parseInt(e.target.value) || 0)
                    }
                    className="h-8 w-20"
                  />
                  <span className="text-xs text-muted-foreground">%</span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-green-600"
                    onClick={() => {
                      onUpdate(item.id, { progress_pct: editProgress });
                      setEditingId(null);
                    }}
                  >
                    <IconCheck className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingId(null)}
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
