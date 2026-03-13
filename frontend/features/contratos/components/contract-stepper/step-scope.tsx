"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconTrash, IconGripVertical } from "@tabler/icons-react";
import { SCOPE_CATEGORIES } from "../../schemas/contract-schemas";
import type { ScopeItemInput } from "../../schemas/contract-schemas";

interface StepScopeProps {
  items: ScopeItemInput[];
  onChange: (items: ScopeItemInput[]) => void;
}

const emptyItem = (): ScopeItemInput => ({
  title: "",
  category: "",
  value: 0,
  status: "pending",
  progress_pct: 0,
  estimated_start: null,
  estimated_end: null,
  sort_order: 0,
});

export function StepScope({ items, onChange }: StepScopeProps) {
  const addItem = () => {
    onChange([...items, { ...emptyItem(), sort_order: items.length }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<ScopeItemInput>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const totalValue = items.reduce((sum, item) => sum + (item.value ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"} de escopo
          </p>
          <p className="text-sm font-medium">
            Total:{" "}
            {totalValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <IconPlus className="h-4 w-4 mr-1" />
          Adicionar Item
        </Button>
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Nenhum item de escopo adicionado
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <IconPlus className="h-4 w-4 mr-1" />
            Adicionar primeiro item
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <IconGripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                #{index + 1}
              </span>
              <div className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(index)}
              >
                <IconTrash className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Titulo</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updateItem(index, { title: e.target.value })
                  }
                  placeholder="Ex: Identidade Visual"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria</Label>
                <Select
                  value={item.category ?? ""}
                  onValueChange={(v) => updateItem(index, { category: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.value ?? 0}
                  onChange={(e) =>
                    updateItem(index, {
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Inicio Estimado</Label>
                <Input
                  type="date"
                  value={item.estimated_start ?? ""}
                  onChange={(e) =>
                    updateItem(index, {
                      estimated_start: e.target.value || null,
                    })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fim Estimado</Label>
                <Input
                  type="date"
                  value={item.estimated_end ?? ""}
                  onChange={(e) =>
                    updateItem(index, {
                      estimated_end: e.target.value || null,
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
