"use client";

import { Badge } from "@/components/ui/badge";
import { DollarSign, User, Calendar } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

interface DealCardProps {
  deal: DealRow;
  onClick: (deal: DealRow) => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  return (
    <div
      className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick(deal)}
    >
      <p className="font-medium text-sm leading-tight truncate">{deal.name}</p>
      {deal.company && (
        <p className="text-xs text-muted-foreground truncate">{deal.company}</p>
      )}

      <div className="mt-2 space-y-1">
        {deal.value != null && deal.value > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(deal.value)}</span>
          </div>
        )}
        {deal.probability != null && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${Math.min(deal.probability, 100)}%` }}
            />
          </div>
        )}
        {deal.owner_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{deal.owner_name}</span>
          </div>
        )}
        {deal.expected_close && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(deal.expected_close).toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
