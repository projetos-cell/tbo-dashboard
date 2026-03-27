"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IconCalculator, IconRefresh, IconCheck, IconX } from "@tabler/icons-react";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import {
  computeServicePricing,
  DEFAULT_PREMISES,
  type PricingPremises,
  type BUCostRow,
  type PricingServiceRow,
  type ServicePricingComputed,
} from "@/features/comercial/services/pricing";

interface Props {
  services: PricingServiceRow[];
  buCosts: BUCostRow[];
  premises: PricingPremises | null;
  isLoading: boolean;
  onServiceUpdate: (id: string, field: "hours_estimated" | "third_party_cost" | "min_price", value: number) => void;
  isSyncing: boolean;
  onSync: (entries: Array<{ id: string; base_price: number }>) => void;
}

interface CellEdit {
  serviceId: string;
  field: "hours_estimated" | "third_party_cost" | "min_price";
  value: string;
}

const BU_COLORS: Record<string, string> = {
  "Digital 3D": "bg-blue-50 text-blue-700 border-blue-200",
  "Branding": "bg-purple-50 text-purple-700 border-purple-200",
  "Marketing": "bg-orange-50 text-orange-700 border-orange-200",
  "Audiovisual": "bg-rose-50 text-rose-700 border-rose-200",
  "Interiores": "bg-teal-50 text-teal-700 border-teal-200",
};

export function PricingEngineTable({
  services,
  buCosts,
  premises,
  isLoading,
  onServiceUpdate,
  isSyncing,
  onSync,
}: Props) {
  const [cellEdit, setCellEdit] = useState<CellEdit | null>(null);

  const activePremises = premises ?? DEFAULT_PREMISES;

  const buCostMap = useMemo(() => {
    const map = new Map<string, BUCostRow>();
    buCosts.forEach((r) => map.set(r.bu, r));
    return map;
  }, [buCosts]);

  const computed = useMemo<ServicePricingComputed[]>(() => {
    return services.map((s) =>
      computeServicePricing(s, buCostMap, activePremises),
    );
  }, [services, buCostMap, activePremises]);

  const grouped = useMemo(() => {
    const map = new Map<string, ServicePricingComputed[]>();
    computed.forEach((row) => {
      const bu = row.bu || "Sem BU";
      if (!map.has(bu)) map.set(bu, []);
      map.get(bu)!.push(row);
    });
    return map;
  }, [computed]);

  function startEdit(serviceId: string, field: CellEdit["field"], currentValue: number) {
    setCellEdit({ serviceId, field, value: String(currentValue) });
  }

  function commitEdit() {
    if (!cellEdit) return;
    const val = parseFloat(cellEdit.value) || 0;
    onServiceUpdate(cellEdit.serviceId, cellEdit.field, val);
    setCellEdit(null);
  }

  function handleSyncAll() {
    const entries = computed
      .filter((r) => r.suggested_price > 0)
      .map((r) => ({ id: r.service_id, base_price: Math.round(r.suggested_price * 100) / 100 }));
    onSync(entries);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          Nenhum serviço ativo. Cadastre serviços em{" "}
          <a href="/comercial/servicos" className="underline">Catálogo de Serviços</a>.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCalculator className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Motor de Preços</CardTitle>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncAll}
                disabled={isSyncing || computed.every((r) => r.suggested_price === 0)}
              >
                <IconRefresh className="mr-1 h-4 w-4" />
                {isSyncing ? "Sincronizando..." : "Sincronizar com Catálogo"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Grava o Preço Sugerido como Preço Base em cada serviço do Catálogo.
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Clique em Horas, Terceiro ou Mínimo para editar inline. Preços calculados em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 text-left font-medium">Serviço</th>
                <th className="py-2 text-right font-medium">Custo/h</th>
                <th className="py-2 text-right font-medium">Horas</th>
                <th className="py-2 text-right font-medium">Terceiro</th>
                <th className="py-2 text-right font-medium">Custo Direto</th>
                <th className="py-2 text-right font-medium">Impostos</th>
                <th className="py-2 text-right font-medium">Comissão</th>
                <th className="py-2 text-right font-medium">Margem</th>
                <th className="py-2 text-right font-medium">Preço Base</th>
                <th className="py-2 text-right font-medium">Mínimo</th>
                <th className="py-2 text-right font-medium text-emerald-700">Sugerido</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(grouped.entries()).map(([bu, rows]) => (
                <>
                  <tr key={`group-${bu}`} className="border-b border-t bg-muted/40">
                    <td colSpan={11} className="py-1.5 pl-2">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${BU_COLORS[bu] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {bu}
                      </span>
                    </td>
                  </tr>
                  {rows.map((row) => {
                    const isEditHours = cellEdit?.serviceId === row.service_id && cellEdit.field === "hours_estimated";
                    const isEditThird = cellEdit?.serviceId === row.service_id && cellEdit.field === "third_party_cost";
                    const isEditMin = cellEdit?.serviceId === row.service_id && cellEdit.field === "min_price";

                    return (
                      <tr key={row.service_id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="py-2 pr-4 font-medium max-w-[200px] truncate">
                          {row.service_name}
                        </td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {row.cost_per_hour > 0 ? formatCurrency(row.cost_per_hour) : "—"}
                        </td>

                        {/* Horas — editável */}
                        <td className="py-2 text-right">
                          {isEditHours ? (
                            <EditCell
                              value={cellEdit.value}
                              onChange={(v) => setCellEdit({ ...cellEdit, value: v })}
                              onCommit={commitEdit}
                              onCancel={() => setCellEdit(null)}
                            />
                          ) : (
                            <button
                              onClick={() => startEdit(row.service_id, "hours_estimated", row.hours_estimated)}
                              className="rounded px-1 hover:bg-muted tabular-nums w-full text-right"
                            >
                              {row.hours_estimated > 0 ? `${row.hours_estimated}h` : <span className="text-muted-foreground opacity-40">—</span>}
                            </button>
                          )}
                        </td>

                        {/* Terceiro — editável */}
                        <td className="py-2 text-right">
                          {isEditThird ? (
                            <EditCell
                              value={cellEdit.value}
                              onChange={(v) => setCellEdit({ ...cellEdit, value: v })}
                              onCommit={commitEdit}
                              onCancel={() => setCellEdit(null)}
                            />
                          ) : (
                            <button
                              onClick={() => startEdit(row.service_id, "third_party_cost", row.third_party_cost)}
                              className="rounded px-1 hover:bg-muted tabular-nums w-full text-right"
                            >
                              {row.third_party_cost > 0 ? formatCurrency(row.third_party_cost) : <span className="text-muted-foreground opacity-40">—</span>}
                            </button>
                          )}
                        </td>

                        <td className="py-2 text-right tabular-nums">
                          {formatCurrency(row.direct_cost)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(row.tax_amount)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(row.commission_amount)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(row.margin_amount)}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {formatCurrency(row.base_price)}
                        </td>

                        {/* Mínimo — editável */}
                        <td className="py-2 text-right">
                          {isEditMin ? (
                            <EditCell
                              value={cellEdit.value}
                              onChange={(v) => setCellEdit({ ...cellEdit, value: v })}
                              onCommit={commitEdit}
                              onCancel={() => setCellEdit(null)}
                            />
                          ) : (
                            <button
                              onClick={() => startEdit(row.service_id, "min_price", row.min_price)}
                              className="rounded px-1 hover:bg-muted tabular-nums w-full text-right"
                            >
                              {row.min_price > 0 ? formatCurrency(row.min_price) : <span className="text-muted-foreground opacity-40">—</span>}
                            </button>
                          )}
                        </td>

                        <td className="py-2 text-right tabular-nums font-semibold text-emerald-600">
                          {row.suggested_price > 0 ? formatCurrency(row.suggested_price) : (
                            <span className="text-muted-foreground opacity-40 font-normal">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EditCell({
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Input
        autoFocus
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        className="h-6 w-20 text-right text-xs px-1"
      />
      <button onClick={onCommit} className="text-green-600 hover:text-green-700 ml-0.5">
        <IconCheck className="h-3 w-3" />
      </button>
      <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
        <IconX className="h-3 w-3" />
      </button>
    </div>
  );
}
