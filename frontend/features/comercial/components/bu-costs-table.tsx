"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconBuildingFactory2, IconCheck, IconX } from "@tabler/icons-react";
import { BU_LIST } from "@/lib/constants";
import { costPerHour } from "@/features/comercial/services/pricing";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type { BUCostRow, BUCostUpdate } from "@/features/comercial/services/pricing";

interface Props {
  buCosts: BUCostRow[];
  isLoading: boolean;
  onSave: (bu: string, updates: BUCostUpdate) => void;
  isSaving: boolean;
}

interface EditState {
  bu: string;
  field: "total_cost_monthly" | "capacity_hours_monthly" | "note";
  value: string;
}

function getBURow(buCosts: BUCostRow[], bu: string): BUCostRow {
  return (
    buCosts.find((r) => r.bu === bu) ?? {
      id: "",
      tenant_id: "",
      bu,
      total_cost_monthly: 0,
      capacity_hours_monthly: 176,
      note: null,
      updated_at: "",
    }
  );
}

export function BUCostsTable({ buCosts, isLoading, onSave, isSaving }: Props) {
  const [editing, setEditing] = useState<EditState | null>(null);

  function startEdit(bu: string, field: EditState["field"], currentValue: string) {
    setEditing({ bu, field, value: currentValue });
  }

  function commitEdit() {
    if (!editing) return;
    const row = getBURow(buCosts, editing.bu);
    const updates: BUCostUpdate = {};

    if (editing.field === "total_cost_monthly") {
      updates.total_cost_monthly = parseFloat(editing.value) || 0;
    } else if (editing.field === "capacity_hours_monthly") {
      updates.capacity_hours_monthly = parseFloat(editing.value) || 176;
    } else {
      updates.note = editing.value || null;
    }

    const hasChange =
      String(row[editing.field] ?? "") !== editing.value;

    if (hasChange) {
      onSave(editing.bu, updates);
    }
    setEditing(null);
  }

  function cancelEdit() {
    setEditing(null);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBuildingFactory2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Custo/Hora por BU</CardTitle>
        </div>
        <CardDescription>
          Clique em qualquer célula para editar. O custo/hora é calculado automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 text-left font-medium">BU</th>
                <th className="py-2 text-right font-medium">Custo Total/mês (R$)</th>
                <th className="py-2 text-right font-medium">Capacidade (h/mês)</th>
                <th className="py-2 text-right font-medium">Custo/hora (R$)</th>
                <th className="py-2 text-left font-medium pl-4">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {BU_LIST.map((bu) => {
                const row = getBURow(buCosts, bu);
                const cph = costPerHour(row);
                const isEditingCost =
                  editing?.bu === bu && editing.field === "total_cost_monthly";
                const isEditingCap =
                  editing?.bu === bu && editing.field === "capacity_hours_monthly";
                const isEditingNote =
                  editing?.bu === bu && editing.field === "note";

                return (
                  <tr key={bu} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="font-normal">
                        {bu}
                      </Badge>
                    </td>

                    {/* Custo Total */}
                    <td className="py-2 text-right">
                      {isEditingCost ? (
                        <div className="flex items-center justify-end gap-1">
                          <Input
                            autoFocus
                            type="number"
                            min={0}
                            step={100}
                            value={editing.value}
                            onChange={(e) =>
                              setEditing({ ...editing, value: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-7 w-32 text-right text-xs"
                            disabled={isSaving}
                          />
                          <button onClick={commitEdit} disabled={isSaving} className="text-green-600 hover:text-green-700">
                            <IconCheck className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit(bu, "total_cost_monthly", String(row.total_cost_monthly))
                          }
                          className="rounded px-2 py-0.5 text-right hover:bg-muted w-full"
                        >
                          {formatCurrency(row.total_cost_monthly)}
                        </button>
                      )}
                    </td>

                    {/* Capacidade */}
                    <td className="py-2 text-right">
                      {isEditingCap ? (
                        <div className="flex items-center justify-end gap-1">
                          <Input
                            autoFocus
                            type="number"
                            min={1}
                            step={8}
                            value={editing.value}
                            onChange={(e) =>
                              setEditing({ ...editing, value: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-7 w-24 text-right text-xs"
                            disabled={isSaving}
                          />
                          <button onClick={commitEdit} disabled={isSaving} className="text-green-600 hover:text-green-700">
                            <IconCheck className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit(bu, "capacity_hours_monthly", String(row.capacity_hours_monthly))
                          }
                          className="rounded px-2 py-0.5 text-right hover:bg-muted w-full"
                        >
                          {row.capacity_hours_monthly}h
                        </button>
                      )}
                    </td>

                    {/* Custo/hora (calculado) */}
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {row.total_cost_monthly > 0 ? (
                        <span className="text-emerald-600">{formatCurrency(cph)}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>

                    {/* Nota */}
                    <td className="py-2 pl-4">
                      {isEditingNote ? (
                        <div className="flex items-center gap-1">
                          <Input
                            autoFocus
                            value={editing.value}
                            onChange={(e) =>
                              setEditing({ ...editing, value: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-7 text-xs"
                            disabled={isSaving}
                          />
                          <button onClick={commitEdit} disabled={isSaving} className="text-green-600 hover:text-green-700">
                            <IconCheck className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(bu, "note", row.note ?? "")}
                          className="rounded px-2 py-0.5 text-left text-muted-foreground hover:bg-muted w-full"
                        >
                          {row.note ?? (
                            <span className="text-xs opacity-40">Adicionar nota...</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
