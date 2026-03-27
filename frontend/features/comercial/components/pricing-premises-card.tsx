"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { IconDeviceFloppy, IconSettings } from "@tabler/icons-react";
import type { PricingPremises, PricingPremisesUpdate } from "@/features/comercial/services/pricing";
import { DEFAULT_PREMISES } from "@/features/comercial/services/pricing";

interface Props {
  premises: PricingPremises | null | undefined;
  isLoading: boolean;
  onSave: (updates: PricingPremisesUpdate) => void;
  isSaving: boolean;
}

function pctToDisplay(val: number): string {
  return (val * 100).toFixed(1);
}

function displayToPct(val: string): number {
  return parseFloat(val) / 100;
}

export function PricingPremisesCard({ premises, isLoading, onSave, isSaving }: Props) {
  const src = premises ?? DEFAULT_PREMISES;

  const [taxPct, setTaxPct] = useState(pctToDisplay(src.tax_pct));
  const [commissionPct, setCommissionPct] = useState(pctToDisplay(src.commission_pct));
  const [targetMargin, setTargetMargin] = useState(pctToDisplay(src.target_margin_pct));
  const [urgencyMultiplier, setUrgencyMultiplier] = useState(String(src.urgency_multiplier));
  const [packageDiscount, setPackageDiscount] = useState(pctToDisplay(src.package_discount_pct));

  useEffect(() => {
    if (!premises) return;
    setTaxPct(pctToDisplay(premises.tax_pct));
    setCommissionPct(pctToDisplay(premises.commission_pct));
    setTargetMargin(pctToDisplay(premises.target_margin_pct));
    setUrgencyMultiplier(String(premises.urgency_multiplier));
    setPackageDiscount(pctToDisplay(premises.package_discount_pct));
  }, [premises]);

  function handleSave() {
    onSave({
      tax_pct: displayToPct(taxPct),
      commission_pct: displayToPct(commissionPct),
      target_margin_pct: displayToPct(targetMargin),
      urgency_multiplier: parseFloat(urgencyMultiplier),
      package_discount_pct: displayToPct(packageDiscount),
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconSettings className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Premissas Gerais</CardTitle>
        </div>
        <CardDescription>
          Parâmetros globais usados no cálculo de todos os preços. Alterar recalcula o motor automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">% Impostos</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                className="h-8 text-sm"
              />
              <span className="text-muted-foreground text-sm">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">% Comissão de Vendas</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                className="h-8 text-sm"
              />
              <span className="text-muted-foreground text-sm">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Margem Líquida Alvo</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                className="h-8 text-sm"
              />
              <span className="text-muted-foreground text-sm">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Multiplicador Urgência</Label>
            <Input
              type="number"
              min={1}
              max={5}
              step={0.05}
              value={urgencyMultiplier}
              onChange={(e) => setUrgencyMultiplier(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Desconto Pacote Integrado</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={packageDiscount}
                onChange={(e) => setPackageDiscount(e.target.value)}
                className="h-8 text-sm"
              />
              <span className="text-muted-foreground text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <IconDeviceFloppy className="mr-1 h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Premissas"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
