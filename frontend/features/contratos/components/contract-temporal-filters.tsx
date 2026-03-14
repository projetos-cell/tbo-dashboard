"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconCalendar } from "@tabler/icons-react";
import { CONTRACT_RENEWAL_WINDOWS } from "@/lib/constants";
import type { ContractFilters } from "@/features/contratos/services/contracts";
import { FilterSection, getMonthRange } from "./contract-filter-helpers";

interface ContractTemporalFiltersProps {
  endDateFrom: string | undefined;
  endDateTo: string | undefined;
  renewalWindowDays: number | undefined;
  onUpdate: (partial: Partial<ContractFilters>) => void;
}

export function ContractTemporalFilters({
  endDateFrom,
  endDateTo,
  renewalWindowDays,
  onUpdate,
}: ContractTemporalFiltersProps) {
  const currentMonth = getMonthRange(0);
  const nextMonth = getMonthRange(1);

  const isCurrentMonth = endDateFrom === currentMonth.from && endDateTo === currentMonth.to;
  const isNextMonth = endDateFrom === nextMonth.from && endDateTo === nextMonth.to;

  return (
    <FilterSection icon={IconCalendar} title="Período de Vencimento">
      {/* Month shortcuts */}
      <div className="flex gap-1.5 mb-2">
        <Button
          variant={isCurrentMonth ? "default" : "outline"}
          size="sm"
          className={`text-xs h-7 ${isCurrentMonth ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
          onClick={() => {
            if (isCurrentMonth) {
              onUpdate({ endDateFrom: undefined, endDateTo: undefined });
            } else {
              onUpdate({ endDateFrom: currentMonth.from, endDateTo: currentMonth.to, renewalWindowDays: undefined });
            }
          }}
        >
          Mês Atual
        </Button>
        <Button
          variant={isNextMonth ? "default" : "outline"}
          size="sm"
          className={`text-xs h-7 ${isNextMonth ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
          onClick={() => {
            if (isNextMonth) {
              onUpdate({ endDateFrom: undefined, endDateTo: undefined });
            } else {
              onUpdate({ endDateFrom: nextMonth.from, endDateTo: nextMonth.to, renewalWindowDays: undefined });
            }
          }}
        >
          Próximo Mês
        </Button>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">De</Label>
          <input
            type="date"
            value={endDateFrom ?? ""}
            onChange={(e) =>
              onUpdate({ endDateFrom: e.target.value || undefined, renewalWindowDays: undefined })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Até</Label>
          <input
            type="date"
            value={endDateTo ?? ""}
            min={endDateFrom ?? undefined}
            onChange={(e) =>
              onUpdate({ endDateTo: e.target.value || undefined, renewalWindowDays: undefined })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Renewal window */}
      <div className="pt-2 space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Janela de Renovação</Label>
        <div className="flex gap-1.5">
          {CONTRACT_RENEWAL_WINDOWS.map((w) => {
            const active = renewalWindowDays === w.value;
            return (
              <Button
                key={w.value}
                variant={active ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${active ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
                onClick={() =>
                  onUpdate({
                    renewalWindowDays: active ? undefined : w.value,
                    endDateFrom: undefined,
                    endDateTo: undefined,
                  })
                }
              >
                {w.label}
              </Button>
            );
          })}
        </div>
      </div>
    </FilterSection>
  );
}
