"use client";

import { Badge } from "@/components/ui/badge";
import { IconCurrencyDollar, IconUser, IconCalendar } from "@tabler/icons-react";
import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealCardProps {
  deal: DealRow;
  onClick: (deal: DealRow) => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick(deal)}
    >
      <div className="flex items-center gap-1.5">
        <p className="font-medium text-sm leading-tight truncate flex-1">{deal.name}</p>
        {deal.source && deal.source !== "manual" && (
          <Badge
            variant="outline"
            className={
              deal.source === "rdstation"
                ? "text-[10px] px-1.5 py-0 h-4 border-blue-300 text-blue-600 bg-blue-50 shrink-0"
                : "text-[10px] px-1.5 py-0 h-4 border-gray-300 text-gray-600 shrink-0"
            }
          >
            {deal.source === "rdstation" ? "RD" : deal.source}
          </Badge>
        )}
      </div>
      {deal.company && (
        <p className="text-xs text-gray-500 truncate">{deal.company}</p>
      )}

      <div className="mt-2 space-y-1">
        {deal.value != null && deal.value > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <IconCurrencyDollar className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{formatCurrency(deal.value)}</span>
          </div>
        )}
        {deal.probability != null && (
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-tbo-orange/70"
              style={{ width: `${Math.min(deal.probability, 100)}%` }}
            />
          </div>
        )}
        {deal.owner_name && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <IconUser className="h-3 w-3" />
            <span className="truncate">{deal.owner_name}</span>
          </div>
        )}
        {deal.expected_close && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <IconCalendar className="h-3 w-3" />
            <span>
              {new Date(deal.expected_close).toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
