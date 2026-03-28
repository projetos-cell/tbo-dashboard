"use client";

import { useState, useMemo } from "react";
import { IconCalculator, IconBolt, IconPackage, IconInfoCircle } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePricingPremises, useBUCosts, usePricingServices } from "@/features/comercial/hooks/use-pricing";
import { useComplexityRules } from "@/features/comercial/hooks/use-proposals-enhanced";
import {
  computeServicePricing,
  costPerHour,
  type BUCostRow,
  type PricingPremises,
  DEFAULT_PREMISES,
} from "@/features/comercial/services/pricing";
import { applyComplexityRules } from "@/features/comercial/services/pricing-complexity";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function PriceRow({
  label,
  value,
  highlight,
  negative,
  tooltip,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
  tooltip?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? "font-semibold" : ""}`}>
      <div className="flex items-center gap-1.5">
        <span className={`text-sm ${highlight ? "text-zinc-900" : "text-zinc-500"}`}>{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IconInfoCircle size={14} className="text-zinc-300" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span
        className={`text-sm font-mono ${
          highlight ? "text-[#E85102] text-base" : negative ? "text-red-500" : "text-zinc-700"
        }`}
      >
        {negative && value > 0 ? "- " : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PricingSimulator() {
  const { data: premises } = usePricingPremises();
  const { data: buCosts, isLoading: loadingBU } = useBUCosts();
  const { data: services, isLoading: loadingServices } = usePricingServices();
  const { data: complexityRules } = useComplexityRules();

  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [customHours, setCustomHours] = useState<number | null>(null);
  const [urgency, setUrgency] = useState(false);
  const [packageDiscount, setPackageDiscount] = useState(false);
  const [selectedComplexityIds, setSelectedComplexityIds] = useState<string[]>([]);

  const effectivePremises: Pick<PricingPremises, "tax_pct" | "commission_pct" | "target_margin_pct"> =
    premises ?? {
      tax_pct: DEFAULT_PREMISES.tax_pct,
      commission_pct: DEFAULT_PREMISES.commission_pct,
      target_margin_pct: DEFAULT_PREMISES.target_margin_pct,
    };

  const buCostMap = useMemo(() => {
    const map = new Map<string, BUCostRow>();
    (buCosts ?? []).forEach((b) => map.set(b.bu, b));
    return map;
  }, [buCosts]);

  const selectedService = services?.find((s) => s.id === selectedServiceId);

  const computed = useMemo(() => {
    if (!selectedService) return null;

    const serviceForCompute = customHours !== null
      ? { ...selectedService, hours_estimated: customHours }
      : selectedService;

    const base = computeServicePricing(serviceForCompute, buCostMap, effectivePremises);

    // Apply selected complexity rules
    const selectedRules = (complexityRules ?? []).filter((r) =>
      selectedComplexityIds.includes(r.id),
    );
    const complexityMultiplier = selectedRules.length > 0
      ? selectedRules.reduce((acc, r) => acc * r.multiplier, 1)
      : base.complexity_multiplier;

    const urgencyMultiplier = urgency ? (premises?.urgency_multiplier ?? DEFAULT_PREMISES.urgency_multiplier) : 1;
    const pkgDiscount = packageDiscount
      ? (premises?.package_discount_pct ?? DEFAULT_PREMISES.package_discount_pct)
      : 0;

    const priceWithComplexity = Math.max(base.base_price, base.min_price) * complexityMultiplier;
    const priceWithUrgency = priceWithComplexity * urgencyMultiplier;
    const discountAmount = priceWithUrgency * pkgDiscount;
    const finalPrice = priceWithUrgency - discountAmount;

    const buRow = selectedService.bu ? buCostMap.get(selectedService.bu) : undefined;
    const cph = buRow ? costPerHour(buRow) : 0;

    return {
      ...base,
      cost_per_hour: cph,
      complexity_multiplier: complexityMultiplier,
      urgency_multiplier: urgencyMultiplier,
      urgency_addition: priceWithComplexity * (urgencyMultiplier - 1),
      package_discount_amount: discountAmount,
      final_price: finalPrice,
    };
  }, [selectedService, customHours, buCostMap, effectivePremises, complexityRules, selectedComplexityIds, urgency, packageDiscount, premises]);

  const isLoading = loadingBU || loadingServices;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <IconCalculator size={18} className="text-zinc-500" />
        <CardTitle className="text-base">Simulador de Preços</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <>
            {/* Inputs */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Serviço</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(services ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          {s.name}
                          {s.bu && (
                            <Badge variant="outline" className="text-[10px] py-0">
                              {s.bu}
                            </Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedService && (
                <div className="space-y-1.5">
                  <Label>
                    Horas estimadas
                    {selectedService.hours_estimated && (
                      <span className="ml-1 text-xs text-zinc-400">
                        (padrão: {selectedService.hours_estimated}h)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder={String(selectedService.hours_estimated ?? 0)}
                    value={customHours ?? ""}
                    onChange={(e) =>
                      setCustomHours(e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </div>
              )}

              {/* Complexity rules multi-select */}
              {(complexityRules ?? []).length > 0 && (
                <div className="space-y-1.5">
                  <Label>Regras de complexidade</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(complexityRules ?? [])
                      .filter((r) => r.is_active)
                      .map((rule) => {
                        const selected = selectedComplexityIds.includes(rule.id);
                        return (
                          <button
                            key={rule.id}
                            onClick={() =>
                              setSelectedComplexityIds((prev) =>
                                selected
                                  ? prev.filter((id) => id !== rule.id)
                                  : [...prev, rule.id],
                              )
                            }
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                              selected
                                ? "bg-[#E85102] text-white border-[#E85102]"
                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            {rule.name} ({rule.multiplier.toFixed(2)}x)
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Switch checked={urgency} onCheckedChange={setUrgency} />
                  <span className="flex items-center gap-1 text-sm text-zinc-600">
                    <IconBolt size={14} className="text-amber-500" />
                    Urgência
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Switch checked={packageDiscount} onCheckedChange={setPackageDiscount} />
                  <span className="flex items-center gap-1 text-sm text-zinc-600">
                    <IconPackage size={14} className="text-purple-500" />
                    Pacote
                  </span>
                </label>
              </div>
            </div>

            {/* Breakdown */}
            {computed && (
              <>
                <Separator />
                <div className="space-y-0">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                    Detalhamento
                  </p>

                  <PriceRow
                    label="Custo/hora (BU)"
                    value={computed.cost_per_hour}
                    tooltip="Custo total da BU dividido pela capacidade mensal"
                  />
                  <PriceRow
                    label="Horas × custo"
                    value={computed.direct_cost - (selectedService?.third_party_cost ?? 0)}
                  />
                  {computed.third_party_cost > 0 && (
                    <PriceRow label="Terceiros" value={computed.third_party_cost} />
                  )}
                  <PriceRow
                    label="Custo direto"
                    value={computed.direct_cost}
                    tooltip="Horas × custo/hora + terceiros"
                  />

                  <Separator className="my-2" />

                  <PriceRow
                    label={`Impostos (${(effectivePremises.tax_pct * 100).toFixed(0)}%)`}
                    value={computed.tax_amount}
                    negative
                  />
                  <PriceRow
                    label={`Comissão (${(effectivePremises.commission_pct * 100).toFixed(0)}%)`}
                    value={computed.commission_amount}
                    negative
                  />
                  <PriceRow
                    label={`Margem (${(effectivePremises.target_margin_pct * 100).toFixed(0)}%)`}
                    value={computed.margin_amount}
                  />
                  <PriceRow label="Preço base" value={computed.base_price} />

                  {computed.complexity_multiplier !== 1 && (
                    <PriceRow
                      label={`Complexidade (×${computed.complexity_multiplier.toFixed(2)})`}
                      value={computed.base_price * (computed.complexity_multiplier - 1)}
                      tooltip="Adicional por regras de complexidade"
                    />
                  )}

                  {urgency && (
                    <PriceRow
                      label={`Urgência (×${computed.urgency_multiplier.toFixed(2)})`}
                      value={computed.urgency_addition}
                      tooltip="Adicional por urgência"
                    />
                  )}

                  {packageDiscount && computed.package_discount_amount > 0 && (
                    <PriceRow
                      label={`Desconto pacote (${((premises?.package_discount_pct ?? DEFAULT_PREMISES.package_discount_pct) * 100).toFixed(0)}%)`}
                      value={computed.package_discount_amount}
                      negative
                    />
                  )}

                  <Separator className="my-2" />

                  <PriceRow label="Preço sugerido" value={computed.final_price} highlight />

                  {computed.min_price > 0 && computed.final_price < computed.min_price && (
                    <p className="text-xs text-amber-600 mt-1">
                      Preço abaixo do mínimo configurado ({formatCurrency(computed.min_price)})
                    </p>
                  )}
                </div>
              </>
            )}

            {!selectedServiceId && (
              <div className="rounded-lg border border-dashed p-6 text-center text-zinc-400">
                <IconCalculator size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Selecione um serviço para simular</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
