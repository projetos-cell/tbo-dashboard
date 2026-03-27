"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ProposalItemDraft } from "./proposal-items-editor";

interface Props {
  items: ProposalItemDraft[];
  urgencyFlag: boolean;
  packageDiscountFlag: boolean;
  urgencyMultiplier: number;
  packageDiscountPct: number;
  onUrgencyChange: (v: boolean) => void;
  onPackageDiscountChange: (v: boolean) => void;
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtPct(n: number) {
  return `${n.toFixed(1).replace(".", ",")}%`;
}

export function ProposalSummaryCard({
  items,
  urgencyFlag,
  packageDiscountFlag,
  urgencyMultiplier,
  packageDiscountPct,
  onUrgencyChange,
  onPackageDiscountChange,
}: Props) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price * (1 - item.discount_pct / 100),
    0,
  );

  const packageDiscount = packageDiscountFlag ? subtotal * (packageDiscountPct / 100) : 0;
  const afterDiscount = subtotal - packageDiscount;
  const total = urgencyFlag ? afterDiscount * urgencyMultiplier : afterDiscount;
  const urgencyAdd = urgencyFlag ? afterDiscount * (urgencyMultiplier - 1) : 0;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Resumo Financeiro
      </p>

      {/* Flags */}
      <div className="flex gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch
            id="urgency"
            checked={urgencyFlag}
            onCheckedChange={onUrgencyChange}
          />
          <Label htmlFor="urgency" className="text-sm cursor-pointer">
            Urgência
            <span className="ml-1 text-xs text-amber-600 font-medium">
              (+{fmtPct((urgencyMultiplier - 1) * 100)})
            </span>
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="pkg"
            checked={packageDiscountFlag}
            onCheckedChange={onPackageDiscountChange}
          />
          <Label htmlFor="pkg" className="text-sm cursor-pointer">
            Desconto pacote
            <span className="ml-1 text-xs text-emerald-600 font-medium">
              (−{fmtPct(packageDiscountPct)})
            </span>
          </Label>
        </div>
      </div>

      <Separator />

      {/* Values */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {packageDiscountFlag && packageDiscount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Desconto pacote (−{fmtPct(packageDiscountPct)})</span>
            <span>−{fmt(packageDiscount)}</span>
          </div>
        )}
        {urgencyFlag && urgencyAdd > 0 && (
          <div className="flex justify-between text-amber-600">
            <span>Adicional urgência (+{fmtPct((urgencyMultiplier - 1) * 100)})</span>
            <span>+{fmt(urgencyAdd)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Total da proposta</span>
          <span className="text-primary">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
